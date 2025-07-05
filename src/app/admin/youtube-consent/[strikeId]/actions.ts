
'use server';

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { redirect } from "next/navigation";
import { updateReportStatus } from '@/lib/reports-store';
import { sendTakedownConfirmationEmail } from '@/lib/services/backend-services';

const takedownSchema = z.object({
  reportId: z.string(),
  infringingUrl: z.string().url(),
  originalUrl: z.string().url(),
  creatorEmail: z.string().email(),
  creatorName: z.string(),
  adminSignature: z.string().min(1),
});

type TakedownData = {
    creatorEmail: string;
    creatorName: string;
    infringingUrl: string;
    originalUrl: string;
    reason: string;
    adminSignature: string;
}

export async function submitTakedownToYouTubeAction(reportId: string, takedownData: TakedownData) {
  // In a real application, this would interact with the YouTube API.
  // For this prototype, we'll simulate the interaction.
  console.log("Simulating submission of takedown notice to YouTube for report:", reportId);
  console.log("Takedown Data:", takedownData);

  try {
    // 1. Update the status of our internal report
    await updateReportStatus(reportId, 'action_taken');

    // 2. Send a confirmation email to the creator
    await sendTakedownConfirmationEmail({
        to: takedownData.creatorEmail,
        creatorName: takedownData.creatorName,
        infringingUrl: takedownData.infringingUrl,
        originalUrl: takedownData.originalUrl
    });

  } catch (error) {
    console.error("Failed to process YouTube takedown:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message };
  }
  
  // 3. Revalidate paths to show updated status
  revalidatePath('/admin/strikes');
  revalidatePath(`/admin/strikes/${reportId}`);

  // 4. Redirect back to the strikes list
  redirect('/admin/strikes');
}
