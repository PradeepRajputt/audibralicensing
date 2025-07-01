'use server';

import { google } from 'googleapis';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getUserById } from '@/lib/users-store';

const formSchema = z.object({
  channelId: z.string().min(10, { message: 'Please enter a valid Channel ID.' }),
});

async function getDb() {
  const client = await clientPromise;
  return client.db("creator-shield-db");
}

/**
 * Verifies a YouTube Channel ID using the YouTube Data API and updates the user's document.
 */
export async function verifyYoutubeChannel(prevState: any, formData: FormData) {
  // In a real app, you would get this from the session
  const userId = 'user_creator_123';
  if (!userId) {
    return { success: false, message: 'Authentication required.', channel: null };
  }
  
  const validatedFields = formSchema.safeParse({
    channelId: formData.get('channelId'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid Channel ID provided.',
      channel: null,
    };
  }

  const { channelId } = validatedFields.data;

  if (!process.env.YOUTUBE_API_KEY) {
    console.error('YouTube API Key is not configured in .env file.');
    return {
      success: false,
      message: 'Server configuration error. Cannot verify channel.',
      channel: null,
    };
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY,
    });

    const response = await youtube.channels.list({
      id: [channelId],
      part: ['snippet', 'id'],
    });

    const channel = response.data.items?.[0];

    if (!channel || !channel.id || !channel.snippet) {
      return {
        success: false,
        message: 'Channel not found. Please check the Channel ID.',
        channel: null,
      };
    }
    
    // Update the user document in MongoDB
    const db = await getDb();
    const user = await getUserById(userId);
    const platforms = user?.platformsConnected || [];
    if (!platforms.includes('youtube')) {
        platforms.push('youtube');
    }

    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { 
            youtubeChannelId: channel.id,
            // also update avatar to youtube channel's avatar
            avatar: channel.snippet.thumbnails?.default?.url,
            platformsConnected: platforms,
        } }
    );
    
    // Revalidate paths to reflect changes across the app
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/analytics');

    return {
      success: true,
      message: 'Channel verified and connected successfully!',
      channel: {
        id: channel.id,
        name: channel.snippet.title ?? 'Untitled Channel',
        avatar: channel.snippet.thumbnails?.default?.url ?? '',
      },
    };
  } catch (error) {
    console.error('Error verifying YouTube channel:', error);
    let message = 'Failed to verify channel due to an API error.';
    if (error instanceof Error && (error as any).code === 400) {
        message = 'The provided Channel ID is invalid. Please double-check it.'
    } else if (error instanceof Error && error.message.includes('API key not valid')) {
        message = 'The YouTube API key is invalid or has expired. Please check server configuration.'
    }
    return {
      success: false,
      message,
      channel: null,
    };
  }
}
