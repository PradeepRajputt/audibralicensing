
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserStatus } from '@/lib/users-store';

export async function suspendCreator(creatorId: string) {
  try {
    await updateUserStatus(creatorId, 'suspended');
    revalidatePath(`/admin/users/${creatorId}`);
    revalidatePath('/admin/users');
    return { success: true, message: 'Creator has been suspended for 24 hours.' };
  } catch(error) {
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

export async function liftSuspension(creatorId: string) {
  try {
    await updateUserStatus(creatorId, 'active');
    revalidatePath(`/admin/users/${creatorId}`);
    revalidatePath('/admin/users');
    return { success: true, message: 'Creator suspension has been lifted.' };
  } catch(error) {
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

export async function deactivateCreator(creatorId: string) {
    try {
        await updateUserStatus(creatorId, 'deactivated');
        revalidatePath(`/admin/users/${creatorId}`);
        revalidatePath('/admin/users');
        return { success: true, message: 'Creator has been deactivated.' };
    } catch(error) {
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
    }
}
