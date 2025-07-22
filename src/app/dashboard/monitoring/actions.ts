'use server';

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { createWebScan } from "@/lib/web-scans-store";
import { processAudio, processVideo } from '@/lib/media-processing';
import fs from 'fs';
import path from 'path';
import os from 'os';

const formSchema = z.object({
  url: z.string(),
  creatorContent: z.string().optional(),
  photoDataUri: z.string().optional(),
  audioDataUri: z.string().optional(),
  videoDataUri: z.string().optional(),
});

export async function scanPageAction(values: z.infer<typeof formSchema>) {
  const userId = "user_creator_123";
  let scanType: 'text' | 'image' | 'audio' | 'video' = 'text';

  if (values.photoDataUri) scanType = 'image';
  else if (values.audioDataUri) scanType = 'audio';
  else if (values.videoDataUri) scanType = 'video';

  console.log('[scanPageAction] Incoming values:', values);
  console.log('[scanPageAction] Detected scanType:', scanType);

  let tempFilePath = '';
  let matchFound = false;
  let matchScore = 0;
  let resultMessage = '';
  let transcript = '';
  let embedding: number[] = [];

  try {
    const tempDir = os.tmpdir();

    if (scanType === 'audio') {
      const base64 = values.audioDataUri?.split(',')[1];
      if (!base64) throw new Error("No valid audio data found.");

      tempFilePath = path.join(tempDir, `scanfile_${Date.now()}.wav`);
      fs.writeFileSync(tempFilePath, Buffer.from(base64, 'base64'));

      const audioResult = await processAudio(tempFilePath);
      if (audioResult.audioHash) {
        matchFound = true;
        matchScore = 1.0;
        resultMessage = 'Audio scan completed successfully.';
      } else {
        resultMessage = 'Audio scan did not find a match.';
      }

    } else if (scanType === 'video') {
      const base64 = values.videoDataUri?.split(',')[1];
      if (!base64) throw new Error("No valid video data found.");

      tempFilePath = path.join(tempDir, `scanfile_${Date.now()}.mp4`);
      fs.writeFileSync(tempFilePath, Buffer.from(base64, 'base64'));

      const videoResult = await processVideo(tempFilePath);
      if (videoResult.videoHashes && videoResult.videoHashes.length > 0) {
        matchFound = true;
        matchScore = 1.0;
        resultMessage = 'Video scan completed successfully.';
      } else {
        resultMessage = 'Video scan did not find a match.';
      }

    } else if (scanType === 'text') {
      // For text scan, send the local file path to FastAPI /scan/text
      const apiRes = await fetch("http://127.0.0.1:8000/scan/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: values.url })
      });
      const result = await apiRes.json();
      if (!apiRes.ok) {
        throw new Error(result.error || "Text scan failed.");
      }
      transcript = result.transcript;
      resultMessage = transcript ? 'Text scan completed successfully.' : 'No transcript could be generated.';
      matchFound = !!transcript;
      matchScore = transcript ? 1.0 : 0;
    } else {
      // Skip image scans for now
      resultMessage = `Scan type "${scanType}" is currently not supported.`;
      return {
        success: false,
        data: {
          matchFound: false,
          matchScore: 0,
          resultMessage,
        },
        message: resultMessage,
      };
    }

    await createWebScan({
      userId,
      pageUrl: values.url,
      scanType,
      status: 'completed',
      matchFound,
      matchScore,
    });

    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    revalidatePath('/dashboard/monitoring');

    return {
      success: true,
      data: { matchFound, matchScore, resultMessage, transcript, embedding },
      message: resultMessage,
    };

  } catch (error) {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    console.error("Error in scanPageAction: ", error);

    await createWebScan({
      userId,
      pageUrl: values.url,
      scanType,
      status: 'failed',
      matchFound: false,
    });

    revalidatePath('/dashboard/monitoring');

    resultMessage = error instanceof Error ? error.message : "Unknown error during scan.";
    return {
      success: false,
      data: {
        matchFound: false,
        matchScore: 0,
        resultMessage,
      },
      message: resultMessage,
    };
  }
}
