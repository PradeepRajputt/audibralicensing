
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserStatus } from '@/lib/users-store';
import { removeReactivationRequest } from '@/lib/reactivations-store';

export async function approveReactivationRequest(creatorId: string) {
  try {
    updateUserStatus(creatorId, 'active');
    removeReactivationRequest(creatorId);
    revalidatePath('/admin/reactivations');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${creatorId}`);
    return { success: true, message: 'Creator has been reactivated.' };
  } catch (error) {
    console.error("Error approving reactivation:", error);
    return { success: false, message: "Failed to approve request."}
  }
}

export async function denyReactivationRequest(creatorId: string) {
  try {
    removeReactivationRequest(creatorId);
    revalidatePath('/admin/reactivations');
    return { success: true, message: 'Reactivation request has been denied.' };
  } catch(error) {
    console.error("Error denying reactivation:", error);
    return { success: false, message: "Failed to deny request."}
  }
}
