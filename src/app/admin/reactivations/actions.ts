'use server';

import { revalidatePath } from 'next/cache';
import { sendReactivationDenialEmail } from '@/lib/services/backend-services';

/**
 * Simulates approving a creator's reactivation request.
 * In a real app, this would update the user's status in Firestore.
 */
export async function approveReactivationRequest(creatorId: string) {
  console.log(`Simulating approval for creator: ${creatorId}`);
  // In a real app, you would update the user document in Firestore here.
  // e.g., await updateDoc(doc(db, 'users', creatorId), { status: 'active' });
  revalidatePath('/admin/reactivations');
  revalidatePath('/admin/users');
  return { success: true, message: 'Creator has been reactivated.' };
}

/**
 * Denies a creator's reactivation request and sends a notification email.
 */
export async function denyReactivationRequest(creatorId: string, creatorEmail: string, creatorName: string) {
  console.log(`Simulating denial for creator: ${creatorId}`);
  
  const emailResult = await sendReactivationDenialEmail({ to: creatorEmail, name: creatorName });

  if (!emailResult.success) {
    return { success: false, message: 'Failed to send denial email. Please try again.' };
  }

  // In a real app, you might update the user's status to 'permanently_denied'
  // or delete the reactivation request document.
  revalidatePath('/admin/reactivations');
  return { success: true, message: `Denial email sent to ${creatorName}.` };
}
