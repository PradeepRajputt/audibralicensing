
'use server';

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { createWebScan } from "@/lib/web-scans-store";
import { processAudio, processVideo, processTranscript } from '@/lib/media-processing';
import fs from 'fs';
import path from 'path';
import os from 'os';

const formSchema = z.object({
  url: z.string().url(),
  creatorContent: z.string().optional(),
  photoDataUri: z.string().optional(),
  audioDataUri: z.string().optional(),
  videoDataUri: z.string().optional(),
});

export async function scanPageAction(values: z.infer<typeof formSchema>) {
  const userId = "user_creator_123";
  let scanType: 'text' | 'image' | 'audio' | 'video' = 'text';
  if (values.photoDataUri) scanType = 'image';
  if (values.audioDataUri) scanType = 'audio';
  if (values.videoDataUri) scanType = 'video';

  let tempFilePath = '';
  let matchFound = false;
  let matchScore = 0;
  try {
    const tempDir = os.tmpdir();
    // Only handle audio/video for real scan
    if (scanType === 'audio' && values.audioDataUri) {
      // Save Data URI to temp file
      const base64 = values.audioDataUri.split(',')[1];
      tempFilePath = path.join(tempDir, `scanfile_${Date.now()}.wav`);
      fs.writeFileSync(tempFilePath, Buffer.from(base64, 'base64'));
      // Process file
      const audioResult = await processAudio(tempFilePath);
      // For demo: matchFound if hash is not empty
      if (audioResult.audioHash) {
        matchFound = true;
        matchScore = 1.0;
      }
    } else if (scanType === 'video' && values.videoDataUri) {
      const base64 = values.videoDataUri.split(',')[1];
      tempFilePath = path.join(tempDir, `scanfile_${Date.now()}.mp4`);
      fs.writeFileSync(tempFilePath, Buffer.from(base64, 'base64'));
      // Process file
      const videoResult = await processVideo(tempFilePath);
      if (videoResult.videoHashes && videoResult.videoHashes.length > 0) {
        matchFound = true;
        matchScore = 1.0;
      }
    } else {
      throw new Error('Only audio and video scan supported in real implementation.');
    }

    await createWebScan({
      userId,
      pageUrl: values.url,
      scanType,
      status: 'completed',
      matchFound,
      matchScore,
    });

    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    revalidatePath('/dashboard/monitoring');
    return {
      success: true,
      data: { matchFound, matchScore }
    };
  } catch (error) {
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    console.error("Error in scanPageAction: ", error);
    await createWebScan({
      userId,
      pageUrl: values.url,
      scanType,
      status: 'failed',
      matchFound: false,
    });
    revalidatePath('/dashboard/monitoring');
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred during the scan."
    };
  }
}
