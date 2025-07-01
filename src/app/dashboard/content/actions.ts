
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { deleteContentById, requestRescan, updateContentTags } from '@/lib/content-store';
import { ProtectedContent } from '@/lib/types';


export async function deleteContentAction(id: string) {
  try {
    await deleteContentById(id);
    revalidatePath('/dashboard/content');
    return { success: true, message: 'Content has been removed from monitoring.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete content.' };
  }
}

export async function rescanContentAction(id: string) {
  try {
    // Simulate a delay for the scan
    await new Promise(resolve => setTimeout(resolve, 1500));
    await requestRescan(id);
    revalidatePath('/dashboard/content');
    return { success: true, message: 'Re-scan initiated successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to initiate re-scan.' };
  }
}

const tagsUpdateSchema = z.object({
  tags: z.string()
});

export async function updateContentTagsAction(id: string, formData: FormData) {
    const validatedFields = tagsUpdateSchema.safeParse({
        tags: formData.get('tags'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid tag format."
        };
    }

    const tagsArray = validatedFields.data.tags.split(',').map(tag => tag.trim()).filter(Boolean);

    try {
        await updateContentTags(id, tagsArray);
        revalidatePath('/dashboard/content');
        return { success: true, message: "Tags updated successfully." };
    } catch(error) {
        return { success: false, message: "Failed to update tags." };
    }
}
