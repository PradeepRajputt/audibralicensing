'use server';

import { z } from 'zod';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { triggerFastApiForNewContent } from '@/lib/services/backend-services';
import type { ProtectedContent } from '@/lib/firebase/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const MOCK_CREATOR_ID = 'user_creator_123';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  contentType: z.enum(['video', 'audio', 'text', 'image']),
  platform: z.enum(['youtube', 'vimeo', 'web']),
  videoURL: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  tags: z.string().optional(),
});

export async function addProtectedContentAction(values: z.infer<typeof formSchema>) {
  if (!db) {
    const message = "Firebase is not configured. Please add your Firebase environment variables to the .env file.";
    console.error(message);
    return { success: false, message };
  }

  try {
    const newContentData: Omit<ProtectedContent, 'contentId'> = {
      creatorId: MOCK_CREATOR_ID,
      title: values.title,
      contentType: values.contentType,
      platform: values.platform,
      videoURL: values.videoURL,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
      uploadDate: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'protectedContent'), newContentData);
    console.log(`Protected content saved with ID: ${docRef.id}`);

    const fullContent: ProtectedContent = {
      ...newContentData,
      contentId: docRef.id,
    };
    await triggerFastApiForNewContent(fullContent);
    
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
