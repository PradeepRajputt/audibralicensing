
'use server';

import { google } from 'googleapis';
import { z } from 'zod';

const formSchema = z.object({
  channelId: z.string().min(10, { message: 'Please enter a valid Channel ID.' }),
});

/**
 * Verifies a YouTube Channel ID using the YouTube Data API.
 * @param channelId The ID of the YouTube channel to verify.
 * @returns An object with success status, and channel data or an error message.
 */
export async function verifyYoutubeChannel(prevState: any, formData: FormData) {
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
      part: ['snippet'],
    });

    const channel = response.data.items?.[0];

    if (!channel || !channel.id || !channel.snippet) {
      return {
        success: false,
        message: 'Channel not found. Please check the Channel ID.',
        channel: null,
      };
    }

    return {
      success: true,
      message: 'Channel verified successfully!',
      channel: {
        id: channel.id,
        name: channel.snippet.title,
        avatar: channel.snippet.thumbnails?.default?.url,
      },
    };
  } catch (error) {
    console.error('Error verifying YouTube channel:', error);
    return {
      success: false,
      message: 'Failed to verify channel due to an API error.',
      channel: null,
    };
  }
}
