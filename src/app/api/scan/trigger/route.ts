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
import { searchYoutubeByKeyword } from '@/lib/services/youtube-service';
import fs from 'fs';

function cosineSimilarity(a: number[], b: number[]): number {
  // Simple cosine similarity for embeddings
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export async function POST(req: NextRequest) {
  let tempFiles: string[] = [];
  try {
    const body = await req.json();
    const { scanId, scanType, language } = body;
    if (!scanId || !scanType) {
      return NextResponse.json({ error: 'Missing required fields: scanId, scanType' }, { status: 400 });
    }
    await dbConnect();
    const scanDoc = await Scan.findById(scanId);
    if (!scanDoc) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }
    const { originalVideo } = scanDoc;
    if (!originalVideo) {
      return NextResponse.json({ error: 'Original video data missing' }, { status: 400 });
    }
    // Use video title as search query (can be improved)
    const candidates = await searchYoutubeByKeyword(originalVideo.title, 10);
    const matches = [];
    for (const candidate of candidates) {
      // Skip if candidate is the original video
      if (candidate.url === originalVideo.url) continue;
      try {
        // Download candidate video
        const videoPath = await downloadYoutubeVideo(candidate.url);
        tempFiles.push(videoPath);
        // Extract audio
        const audioPath = await extractAudio(videoPath);
        tempFiles.push(audioPath);
        let matchScore = 0;
        let isMatch = false;
        if (scanType === 'audio') {
          const audioResult = await processAudio(audioPath);
          // Simple string comparison for now (can use hamming distance, etc.)
          if (audioResult.audioHash && originalVideo.audioHash && audioResult.audioHash === originalVideo.audioHash) {
            isMatch = true;
            matchScore = 1.0;
          }
        } else if (scanType === 'video') {
          const videoResult = await processVideo(videoPath);
          const origHashes = (originalVideo.videoHash || '').split(',');
          if (videoResult.videoHashes && origHashes.length > 0) {
            // Count how many frame hashes match
            const matchesCount = videoResult.videoHashes.filter(h => origHashes.includes(h)).length;
            matchScore = matchesCount / Math.max(origHashes.length, 1);
            if (matchScore > 0.5) isMatch = true; // Threshold
          }
        } else if (scanType === 'transcript') {
          const transcriptResult = await processTranscript(audioPath, language);
          if (transcriptResult.embedding && originalVideo.transcriptEmbedding) {
            const origEmbedding = JSON.parse(originalVideo.transcriptEmbedding);
            matchScore = cosineSimilarity(transcriptResult.embedding, origEmbedding);
            if (matchScore > 0.8) isMatch = true; // Threshold
          }
        }
        if (isMatch) {
          matches.push({
            matchedUrl: candidate.url,
            matchedTitle: candidate.title,
            matchType: scanType,
            matchScore,
            detectedAt: new Date(),
          });
        }
      } catch (err) {
        // Ignore errors for individual candidates
        continue;
      }
    }
    // Save scan result (only matched videos)
    scanDoc.scans.push({
      scanType,
      status: 'completed',
      timestamp: new Date(),
      matches,
    });
    await scanDoc.save();
    // Clean up temp files
    for (const f of tempFiles) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    return NextResponse.json({ success: true, matches });
  } catch (err) {
    // Clean up temp files on error
    for (const f of tempFiles) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    console.error('Error in /api/scan/trigger:', err);
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 