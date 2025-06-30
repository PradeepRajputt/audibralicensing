
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserStatus } from '@/lib/users-store';
// Email sending is commented out as it requires external service configuration.
// import { sendReactivationDenialEmail, sendReactivationApprovalEmail } from '@/lib/services/backend-services';

/**
 * Simulates approving a creator's reactivation request.
 * In this prototype, it updates the status in the local store.
 */
export async function approveReactivationRequest(creatorId: string, creatorEmail: string, creatorName: string) {
  console.log(`Approving reactivation for creator: ${creatorId}`);

  // const emailResult = await sendReactivationApprovalEmail({ to: creatorEmail, name: creatorName });
  // if (!emailResult.success) {
  //   return { success: false, message: 'Failed to send approval email. Please try again.' };
  // }
  
  updateUserStatus(creatorId, 'active');
  
  revalidatePath('/admin/reactivations');
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${creatorId}`);

  let message = `Creator has been reactivated.`;
  // if (emailResult.simulated) {
  //   message = `Creator has been reactivated. Email sending was simulated as SendGrid is not configured.`;
  // }

  return { success: true, message };
}

/**
 * Denies a creator's reactivation request.
 */
export async function denyReactivationRequest(creatorId: string, creatorEmail: string, creatorName: string) {
  console.log(`Denying reactivation for creator: ${creatorId}`);
  
  // const emailResult = await sendReactivationDenialEmail({ to: creatorEmail, name: creatorName });
  // if (!emailResult.success) {
  //   return { success: false, message: 'Failed to send denial email. Please try again.' };
  // }
  
  // No status change on denial, just removing the request.
  
  revalidatePath('/admin/reactivations');
  
  let message = `Denial for ${creatorName} has been processed.`;
  // if (emailResult.simulated) {
  //   message = `Denial email sending was simulated for ${creatorName} as SendGrid is not configured.`;
  // }

  return { success: true, message };
}
