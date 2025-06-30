
'use server';

import { z } from 'zod';
import { collection, Timestamp, addDoc } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
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
  if (!adminDb) {
    const message = "Firebase Admin is not configured. Please check server credentials.";
    console.error(message);
    return { success: false, message: 'Server is not configured for this action. Please contact support.' };
  }

  try {
    const newContentData: Omit<ProtectedContent, 'contentId'> = {
      creatorId: MOCK_CREATOR_ID,
      title: values.title,
      contentType: values.contentType,
      platform: values.platform,
      videoURL: values.videoURL,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
      uploadDate: Timestamp.now().toDate().toISOString(),
    };

    const docRef = await adminDb.collection('protectedContent').add(newContentData);
    console.log(`Protected content saved with ID: ${docRef.id}`);

    const fullContent: ProtectedContent = {
      ...newContentData,
      id: docRef.id,
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
