import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs';
import os from 'os';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import { extractAudio, processAudio, processVideo, processTranscript } from '@/lib/media-processing';
import mongoose from 'mongoose';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      uploadDir: os.tmpdir(),
      keepExtensions: true,
    });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

// Helper to push a new match to the scans array, keep max 25, sorted by detectedAt or timestamp
function pushMatchToScans(scanDoc: any, newMatch: any) {
  scanDoc.scans.push(newMatch);
  // Prefer detectedAt, fallback to timestamp, fallback to Date.now
  scanDoc.scans.sort((a: any, b: any) => {
    const dateA = new Date(a.detectedAt || a.timestamp || Date.now()).getTime();
    const dateB = new Date(b.detectedAt || b.timestamp || Date.now()).getTime();
    return dateB - dateA;
  });
  if (scanDoc.scans.length > 25) {
    scanDoc.scans = scanDoc.scans.slice(0, 25);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  let tempFilePath = '';
  let audioPath = '';
  try {
    // Parse multipart form
    const { fields, files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    tempFilePath = file.filepath;
    const originalName = file.originalFilename || 'uploaded';
    const mimeType = file.mimetype || '';
    const ext = path.extname(originalName).toLowerCase();
    const allowedVideoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const allowedAudioExts = ['.mp3', '.wav', '.aac', '.flac', '.ogg'];
    const isVideo = mimeType.startsWith('video/') || allowedVideoExts.includes(ext);
    const isAudio = mimeType.startsWith('audio/') || allowedAudioExts.includes(ext);
    if (!isVideo && !isAudio) {
      return res.status(400).json({ error: 'Only audio or video files are allowed (mp4, mov, avi, mkv, webm, mp3, wav, aac, flac, ogg)' });
    }
    await dbConnect();
    // Extract audio if video, else use as is
    if (isVideo) {
      audioPath = await extractAudio(tempFilePath);
    } else {
      audioPath = tempFilePath;
    }
    // Process audio hash
    const audioResult = await processAudio(audioPath);
    // Process video hash (if video)
    let videoResult = { videoHashes: [] as string[] };
    if (isVideo) {
      videoResult = await processVideo(tempFilePath);
    }
    // Process transcript/embedding
    let transcriptResult = { transcript: '', embedding: [] as number[] };
    try {
      transcriptResult = await processTranscript(audioPath);
    } catch (e) {
      // Transcript is optional, log and continue
      console.warn('Transcript processing failed:', e);
    }
    // Save to DB (push to originalVideo array, max 10, sorted by submittedAt desc)
    let scanDoc = await Scan.findOne({ creatorId: fields.creatorId
      ? new mongoose.Types.ObjectId(Array.isArray(fields.creatorId) ? fields.creatorId[0] : fields.creatorId)
      : undefined });
    const newOriginalVideo = {
      url: 'local-upload',
      title: originalName,
      audioHash: audioResult.audioHash || '',
      videoHash: (videoResult.videoHashes && videoResult.videoHashes.length > 0) ? videoResult.videoHashes.join(',') : '',
      transcriptEmbedding: transcriptResult.embedding ? JSON.stringify(transcriptResult.embedding) : '',
      submittedAt: new Date(),
    };
    if (!scanDoc) {
      scanDoc = await Scan.create({
        creatorId: fields.creatorId
          ? new mongoose.Types.ObjectId(Array.isArray(fields.creatorId) ? fields.creatorId[0] : fields.creatorId)
          : undefined,
        originalVideo: [newOriginalVideo],
        scans: []
      });
    } else {
      scanDoc.originalVideo.push(newOriginalVideo);
      scanDoc.originalVideo.sort((a: any, b: any) => b.submittedAt - a.submittedAt);
      if (scanDoc.originalVideo.length > 10) {
        scanDoc.originalVideo = scanDoc.originalVideo.slice(0, 10);
      }
      await scanDoc.save();
    }
    // Clean up temp files
    if (isVideo && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    return res.status(200).json({ success: true, scanId: scanDoc._id, scanDoc });
  } catch (err: any) {
    // Clean up temp files on error
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    console.error('Error in /api/scan/upload:', err);
    return res.status(500).json({ error: 'Upload failed', details: String(err && err.message ? err.message : err) });
  }
} 