import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Scan from '@/models/Scan';
import dbConnect from '@/lib/mongodb';
import {
  downloadYoutubeVideo,
  extractAudio,
  processAudio,
  processVideo,
  processTranscript
} from '@/lib/media-processing';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

export async function POST(req: NextRequest) {
  let videoPath = '';
  let audioPath = '';
  try {
    const body = await req.json();
    const { url, title, creatorId, language } = body;

    if (!url || !creatorId) {
      return NextResponse.json({ error: 'Missing required fields: url, creatorId' }, { status: 400 });
    }

    await dbConnect();

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `scanfile_${Date.now()}.mp4`);

    // 1. Download YouTube video
    videoPath = await downloadYoutubeVideo(url);

    // 2. Extract audio
    audioPath = await extractAudio(videoPath);

    // 3. Process audio hash
    const audioResult = await processAudio(audioPath);

    // 4. Process video hash
    const videoResult = await processVideo(videoPath);

    // 5. Process transcript + embedding
    const transcriptResult = await processTranscript(audioPath, language);

    // 6. Save to DB
    const scanDoc = new Scan({
      creatorId: new mongoose.Types.ObjectId(creatorId),
      originalVideo: {
        url,
        title: title || '',
        audioHash: audioResult.audioHash || '',
        videoHash: (videoResult.videoHashes && videoResult.videoHashes.length > 0) ? videoResult.videoHashes.join(',') : '',
        transcriptEmbedding: transcriptResult.embedding ? JSON.stringify(transcriptResult.embedding) : '',
        submittedAt: new Date(),
      },
      scans: [],
    });
    await scanDoc.save();

    // 7. Clean up temp files
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    return NextResponse.json({ success: true, scanId: scanDoc._id });
  } catch (err) {
    // Clean up temp files on error
    if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    console.error('Error in /api/scan/original:', err);
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 