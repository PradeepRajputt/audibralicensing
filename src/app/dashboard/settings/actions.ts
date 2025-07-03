
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getUserById, updateUser, disconnectYoutubeChannel } from '@/lib/users-store';
import axios from 'axios';

const formSchema = z.object({
  channelId: z.string().min(10, { message: 'Please enter a valid Channel ID.' }),
});

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
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
      console.error("YOUTUBE_API_KEY is not set in the environment variables.");
      return { success: false, message: "Server configuration error: YouTube API key is missing.", channel: null };
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: apiKey,
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return {
        success: false,
        message: 'YouTube channel not found. Please check the Channel ID.',
        channel: null,
      };
    }

    const channelData = response.data.items[0];
    
    // Use an upsert operation to create the user if they don't exist
    const user = await getUserById(userId);
    const platforms = user?.platformsConnected || [];
    if (!platforms.includes('youtube')) {
        platforms.push('youtube');
    }

    await updateUser(userId, {
        displayName: user?.displayName || channelData.snippet.title,
        youtubeChannelId: channelData.id,
        avatar: channelData.snippet.thumbnails?.default?.url ?? user?.avatar,
        platformsConnected: platforms,
    });
    
    revalidatePath('/dashboard', 'layout');

    return {
      success: true,
      message: 'Channel verified and connected successfully!',
      channel: {
        id: channelData.id,
        name: channelData.snippet.title,
        avatar: channelData.snippet.thumbnails.default.url,
      },
    };
  } catch (error) {
    console.error('Error verifying YouTube Channel:', error);
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data.error;
      const errorMessage = apiError.message || "An error occurred with the YouTube API.";
      return {
        success: false,
        message: `API Error: ${errorMessage}`,
        channel: null
      };
    }
    const message = error instanceof Error ? error.message : "An unexpected error occurred during channel verification.";
    return {
      success: false,
      message,
      channel: null,
    };
  }
}


export async function disconnectYoutubeChannelAction() {
    // In a real app, you would get this from the session
    const userId = 'user_creator_123';
    try {
        await disconnectYoutubeChannel(userId);
        revalidatePath('/dashboard', 'layout'); 
        return { success: true, message: "YouTube channel has been disconnected." }
    } catch(error) {
        console.error("Error disconnecting channel:", error);
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred."}
    }
}
