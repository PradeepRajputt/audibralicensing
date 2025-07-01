
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserStatus } from '@/lib/users-store';
import { removeReactivationRequest } from '@/lib/reactivations-store';
import { sendReactivationApprovalEmail, sendReactivationDenialEmail } from '@/lib/services/backend-services';

export async function approveReactivationRequest(creatorId: string, email: string, name: string) {
  try {
    await updateUserStatus(creatorId, 'active');
    await removeReactivationRequest(creatorId);
    
    // Attempt to send email but don't fail the whole action if it errors
    await sendReactivationApprovalEmail({ to: email, name });
    
    revalidatePath('/admin/reactivations');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${creatorId}`);
    return { success: true, message: 'Creator has been reactivated.' };
  } catch (error) {
    console.error("Error approving reactivation:", error);
    return { success: false, message: "Failed to approve request."}
  }
}

export async function denyReactivationRequest(creatorId: string, email: string, name: string) {
  try {
    await removeReactivationRequest(creatorId);

    // Attempt to send email but don't fail the whole action if it errors
    await sendReactivationDenialEmail({ to: email, name });

    revalidatePath('/admin/reactivations');
    return { success: true, message: 'Reactivation request has been denied.' };
  } catch(error) {
    console.error("Error denying reactivation:", error);
    return { success: false, message: "Failed to deny request."}
  }
}
