
'use server';

import { revalidatePath } from 'next/cache';
import { getReportById, updateReportStatus } from '@/lib/reports-store';
import { getUserById } from '@/lib/users-store';
import { sendStrikeApprovalEmail, sendStrikeDenialEmail } from '@/lib/services/backend-services';


export async function approveAndEmailAction({ strikeId, templateId }: { strikeId: string; templateId: string; }) {
  try {
    const report = await getReportById(strikeId);
    if (!report) throw new Error('Report not found.');

    const creator = await getUserById(report.creatorId);
    if (!creator || !creator.email) throw new Error('Creator not found or email is missing.');
    
    // 1. Send the email
    await sendStrikeApprovalEmail({
      to: 'onlinewlallah99@gmail.com', // Hardcoded for testing
      creatorName: creator.displayName || 'Creator',
      infringingUrl: report.suspectUrl,
      submissionDate: report.submitted,
      templateId: templateId
    });

    // 2. Update the report status
    await updateReportStatus(strikeId, 'approved');

    // 3. Revalidate paths
    revalidatePath('/admin/strikes');
    revalidatePath(`/admin/strikes/${strikeId}`);
    
    return { success: true, message: 'Strike request approved and notification sent.' };

  } catch (error) {
    console.error("Error in approveAndEmailAction:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: message };
  }
}


/**
 * Denies a copyright strike request and sends a notification email.
 */
export async function denyAndEmailAction({ strikeId, reason }: { strikeId: string; reason: string }) {
  try {
    const report = await getReportById(strikeId);
    if (!report) throw new Error('Report not found.');

    const creator = await getUserById(report.creatorId);
    if (!creator || !creator.email) throw new Error('Creator not found or email is missing.');

    // 1. Send the denial email
    await sendStrikeDenialEmail({
      to: 'onlinewlallah99@gmail.com', // Hardcoded for testing
      creatorName: creator.displayName || 'Creator',
      infringingUrl: report.suspectUrl,
      reason: reason
    });

    // 2. Update the report status
    await updateReportStatus(strikeId, 'rejected');

    // 3. Revalidate paths
    revalidatePath('/admin/strikes');
    revalidatePath(`/admin/strikes/${strikeId}`);
    
    return { success: true, message: 'Strike request denied and notification sent.' };

  } catch (error) {
    console.error("Error in denyAndEmailAction:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: message };
  }
}

    