
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createContent } from '@/lib/content-store';


const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  contentType: z.enum(['video', 'audio', 'text', 'image']),
  platform: z.enum(['youtube', 'vimeo', 'web']),
  videoURL: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  tags: z.string().optional(),
});

export async function addProtectedContentAction(values: z.infer<typeof formSchema>) {
  // In a real app, you would get the authenticated user's ID
  const creatorId = "user_creator_123";
  
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(issue => issue.message).join(', ');
    return { success: false, message: errorMessages };
  }
  
  try {
    const tagsArray = parsed.data.tags ? parsed.data.tags.split(',').map(tag => tag.trim()) : [];
    
    await createContent({
        ...parsed.data,
        tags: tagsArray,
        creatorId: creatorId,
    });
    
  } catch (error) {
    console.error('Error adding protected content:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred. Please try again.' };
  }
  
  revalidatePath('/dashboard/content');
  redirect('/dashboard/content');
}
