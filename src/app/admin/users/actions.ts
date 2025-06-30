
'use server';

import { google } from 'googleapis';
import type { User } from '@/lib/firebase/types';
import { getAllUsers as dbGetAllUsers } from '@/lib/users';


export type CreatorStatus = {
  uid: string;
  youtubeChannelId: string;
  status: 'Active' | 'Not Found' | 'Error' | 'Not Connected';
  message: string;
};

export async function getAllUsers(): Promise<User[]> {
    try {
        return await dbGetAllUsers();
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

/**
 * Fetches the status of multiple YouTube channels based on their IDs.
 * This is a server action and requires the YOUTUBE_API_KEY to be set in .env.
 */
export async function getCreatorStatuses(creators: User[]): Promise<CreatorStatus[]> {
  if (!process.env.YOUTUBE_API_KEY) {
    console.error('YouTube API Key is not configured.');
    return creators.map(c => ({ 
        uid: c.uid, 
        youtubeChannelId: c.youtubeChannelId || 'N/A',
        status: 'Error', 
        message: 'Server not configured' 
    }));
  }

  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });

  const results: CreatorStatus[] = [];

  for (const creator of creators) {
    if (!creator.youtubeChannelId) {
      results.push({ 
        uid: creator.uid, 
        youtubeChannelId: 'N/A',
        status: 'Not Connected', 
        message: 'No YouTube channel ID provided.' 
      });
      continue;
    }

    try {
      const response = await youtube.channels.list({
        id: [creator.youtubeChannelId],
        part: ['snippet'], // A lightweight part to check for existence
      });

      if (response.data.items && response.data.items.length > 0) {
        results.push({ 
            uid: creator.uid, 
            youtubeChannelId: creator.youtubeChannelId,
            status: 'Active', 
            message: 'Channel is active.' 
        });
      } else {
        results.push({ 
            uid: creator.uid, 
            youtubeChannelId: creator.youtubeChannelId,
            status: 'Not Found', 
            message: 'Channel ID could not be found.' 
        });
      }
    } catch (error) {
      console.error(`Error fetching status for channel ${creator.youtubeChannelId}:`, error);
      results.push({ 
        uid: creator.uid, 
        youtubeChannelId: creator.youtubeChannelId,
        status: 'Error', 
        message: 'API error occurred.' 
      });
    }
  }

  return results;
}
