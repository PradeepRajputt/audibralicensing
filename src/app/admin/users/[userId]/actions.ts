
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserStatus as dbUpdateUserStatus } from '@/lib/users-store';

// Note: These actions now call the client-side store, which is suitable for this prototype.
// In a real application, these would interact directly with a database via server-only functions.

export async function suspendCreator(creatorId: string) {
  try {
    dbUpdateUserStatus(creatorId, 'suspended');
    revalidatePath(`/admin/users/${creatorId}`);
    revalidatePath('/admin/users');
    return { success: true, message: 'Creator has been suspended for 24 hours.' };
  } catch(error) {
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

export async function liftSuspension(creatorId: string) {
  try {
    dbUpdateUserStatus(creatorId, 'active');
    revalidatePath(`/admin/users/${creatorId}`);
    revalidatePath('/admin/users');
    return { success: true, message: 'Creator suspension has been lifted.' };
  } catch(error) {
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

export async function deactivateCreator(creatorId: string) {
    try {
        dbUpdateUserStatus(creatorId, 'deactivated');
        revalidatePath(`/admin/users/${creatorId}`);
        revalidatePath('/admin/users');
        return { success: true, message: 'Creator has been deactivated.' };
    } catch(error) {
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
    }
}
