
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getUserById, updateUser, disconnectYoutubeChannel as disconnect } from '@/lib/users-store';

const formSchema = z.object({
  channelId: z.string().min(10, { message: 'Please enter a valid Channel ID.' }),
});

/**
 * Verifies a YouTube Channel ID using a mocked API call and updates the user's document.
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

  // MOCK IMPLEMENTATION: Simulate API call to avoid needing a real key.
  
  // Basic validation for the Channel ID format
  if (!channelId.startsWith('UC') || channelId.length < 24) {
      return {
        success: false,
        message: 'Channel not found. Please check the Channel ID format (e.g., UC...).',
        channel: null,
      };
  }
  
  // Simulate a delay to feel more realistic
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Mock channel data
    const mockChannelData = {
        id: channelId,
        snippet: {
            title: 'Verified Mock Channel',
            thumbnails: {
                default: {
                    url: `https://i.pravatar.cc/150?u=${channelId}`,
                },
            },
        },
    };

    // Update the user document in the in-memory store
    const user = await getUserById(userId);
    const platforms = user?.platformsConnected || [];
    if (!platforms.includes('youtube')) {
        platforms.push('youtube');
    }

    await updateUser(userId, {
        displayName: user?.displayName || mockChannelData.snippet.title,
        youtubeChannelId: mockChannelData.id,
        avatar: mockChannelData.snippet.thumbnails?.default?.url ?? user?.avatar,
        platformsConnected: platforms,
    });
    
    // Revalidate paths to reflect changes across the app
    revalidatePath('/dashboard', 'layout');

    return {
      success: true,
      message: 'Channel verified and connected successfully!',
      channel: {
        id: mockChannelData.id,
        name: mockChannelData.snippet.title,
        avatar: mockChannelData.snippet.thumbnails.default.url,
      },
    };
  } catch (error) {
    console.error('Error in mock verifyYoutubeChannel:', error);
    return {
      success: false,
      message: "An unexpected error occurred during channel connection.",
      channel: null,
    };
  }
}


export async function disconnectYoutubeChannelAction() {
    // In a real app, you would get this from the session
    const userId = 'user_creator_123';
    try {
        await disconnect(userId);
        revalidatePath('/dashboard', 'layout'); 
        return { success: true, message: "YouTube channel has been disconnected." }
    } catch(error) {
        console.error("Error disconnecting channel:", error);
        return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred."}
    }
}
