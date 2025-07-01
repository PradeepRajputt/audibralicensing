
'use server';

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { monitorWebPagesForCopyrightInfringements } from "@/ai/flows/monitor-web-pages";
import { addScan } from '@/lib/web-scans-store';

const formSchema = z.object({
  url: z.string().url(),
  creatorContent: z.string().optional(),
  photoDataUri: z.string().optional(),
});

export async function scanPageAction(values: z.infer<typeof formSchema>) {
  // In a real app, this would come from the session.
  const userId = 'user_creator_123';
  
  try {
    const result = await monitorWebPagesForCopyrightInfringements({
      url: values.url,
      creatorContent: values.creatorContent,
      photoDataUri: values.photoDataUri,
    });

    await addScan({
        userId,
        pageUrl: values.url,
        scanType: values.photoDataUri ? 'image' : 'text',
        status: 'completed',
        matchFound: result.matchFound,
        matchScore: result.confidenceScore,
    });

    // Revalidate the monitoring page to update the history
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
      scanType: values.photoDataUri ? 'image' : 'text',
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
