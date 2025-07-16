import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Scan from '@/models/Scan';
import dbConnect from '@/lib/mongodb';
import {
  processAudio,
  processVideo,
  processTranscript
} from '@/lib/media-processing';
import fs from 'fs';
// @ts-ignore
import formidable, { Fields, Files } from 'formidable'; // If types not installed, ignore for now

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let videoPath = '';
  let audioPath = '';
  try {
    await dbConnect();
    const form = new formidable.IncomingForm({ multiples: false });
    form.parse(req, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        return res.status(400).json({ error: 'Error parsing form data', details: String(err) });
      }
      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      videoPath = Array.isArray(file) ? file[0].filepath : file.filepath;
      const creatorId = fields.creatorId;
      const title = fields.title || '';
      const language = fields.language || undefined;
      if (!creatorId) {
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        return res.status(400).json({ error: 'Missing creatorId' });
      }
      // 1. Extract audio
      audioPath = videoPath.replace(/\.[^/.]+$/, '.wav');
      // @ts-ignore
      const ffmpeg = require('fluent-ffmpeg');
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .output(audioPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
      // 2. Process audio hash
      const audioResult = await processAudio(audioPath);
      // 3. Process video hash
      const videoResult = await processVideo(videoPath);
      // 4. Process transcript + embedding
      const transcriptResult = await processTranscript(audioPath, language);
      // 5. Save to DB
      const scanDoc = new Scan({
        creatorId: new mongoose.Types.ObjectId(creatorId as string),
        originalVideo: {
          url: '',
          title: title as string,
          audioHash: audioResult.audioHash || '',
          videoHash: (videoResult.videoHashes && videoResult.videoHashes.length > 0) ? videoResult.videoHashes.join(',') : '',
          transcriptEmbedding: transcriptResult.embedding ? JSON.stringify(transcriptResult.embedding) : '',
          submittedAt: new Date(),
        },
        scans: [],
      });
      await scanDoc.save();
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      return res.status(200).json({ success: true, scanId: scanDoc._id });
    });
  } catch (err) {
    if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    console.error('Error in /api/scan/upload:', err);
    return res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
} 