
'use server';

import { revalidatePath } from 'next/cache';
import { updateReportStatus } from '@/lib/reports-store';


/**
 * Approves a copyright strike request.
 */
export async function approveStrikeRequest(strikeId: string) {
  try {
    await updateReportStatus(strikeId, 'approved');
    revalidatePath('/admin/strikes');
    revalidatePath(`/admin/strikes/${strikeId}`);
    return { success: true, message: 'Strike request has been approved.' };
  } catch (error) {
    console.error("Error approving strike request:", error);
    return { success: false, message: 'Failed to approve strike request.' };
  }
}

/**
 * Denies a copyright strike request.
 */
export async function denyStrikeRequest(strikeId: string) {
  try {
    await updateReportStatus(strikeId, 'rejected');
    revalidatePath('/admin/strikes');
    revalidatePath(`/admin/strikes/${strikeId}`);
    return { success: true, message: 'Strike request has been denied.' };
  } catch (error) {
    console.error("Error denying strike request:", error);
    return { success: false, message: 'Failed to deny strike request.' };
  }
}
