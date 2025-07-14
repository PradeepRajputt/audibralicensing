
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createContent } from '@/lib/content-store';
import { getUserByEmail } from '@/lib/users-store';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  contentType: z.enum(['video', 'audio', 'text', 'image']),
  platform: z.enum(['youtube', 'vimeo', 'web']),
  videoURL: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  tags: z.string().optional(),
});

export async function addProtectedContentAction(values: z.infer<typeof formSchema>, userEmail: string) {
  const user = await getUserByEmail(userEmail);
  if (!user) {
    return { success: false, message: 'Could not find creator.' };
  }
  const creatorId = user._id.toString();
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(issue => issue.message).join(', ');
    return { success: false, message: errorMessages };
  }
  try {
    const tagsArray = parsed.data.tags
      ? Array.isArray(parsed.data.tags)
        ? parsed.data.tags
        : parsed.data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];
    await createContent({
      ...parsed.data,
      tags: tagsArray,
      creatorId,
    });
  } catch (error) {
    console.error('Error adding protected content:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
  revalidatePath('/dashboard/content');
  redirect('/dashboard/content');
}
