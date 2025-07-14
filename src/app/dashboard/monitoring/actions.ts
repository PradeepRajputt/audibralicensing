
'use server';

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { monitorWebPagesForCopyrightInfringements } from "@/ai/flows/monitor-web-pages";
import { addScan } from "@/lib/web-scans-store";

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
  try {
    const result = await monitorWebPagesForCopyrightInfringements({
      url: values.url,
      creatorContent: values.creatorContent,
      photoDataUri: values.photoDataUri,
      audioDataUri: values.audioDataUri,
      videoDataUri: values.videoDataUri,
    });

    await addScan({
        userId,
        pageUrl: values.url,
        scanType,
        status: 'completed',
        matchFound: result.matchFound,
        matchScore: result.confidenceScore,
    });

    revalidatePath('/dashboard/monitoring');

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Error in scanPageAction: ", error);
    await addScan({
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
