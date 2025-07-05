
'use server';

import { google } from 'googleapis';
import { getUserById } from '../users-store';
import { auth as adminAuth } from 'firebase-admin'; // This will not work in this environment
import { getAuth } from "firebase/auth";


async function getYoutubeClient(userId: string) {
    // This is a simplified, conceptual implementation.
    // In a real app, you would securely store and retrieve the user's OAuth tokens.
    // We are mocking this by assuming the `accessToken` is stored on the user object.
    const user = await getUserById(userId);

    if (!user || !user.accessToken) {
        throw new Error("YouTube account not connected or token is missing.");
    }
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    return google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });
}


/**
 * Fetches core statistics for the authenticated user's YouTube channel.
 * @param userId The internal user ID.
 * @returns An object with channel statistics or null if not found.
 */
export async function getChannelStats(userId: string) {
  try {
    const youtube = await getYoutubeClient(userId);
    const response = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true,
    });

    const channel = response.data.items?.[0];

    if (!channel?.id || !channel?.snippet || !channel?.statistics) {
      console.error(`Could not find channel for authenticated user: ${userId}`);
      return null;
    }

    return {
      id: channel.id,
      title: channel.snippet.title,
      avatar: channel.snippet.thumbnails?.default?.url,
      subscribers: parseInt(channel.statistics.subscriberCount ?? '0', 10),
      views: parseInt(channel.statistics.viewCount ?? '0', 10),
    };
  } catch (error) {
    const err = error as any;
    console.error(`Error fetching channel stats for ${userId}:`, err.message);
    if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message);
    }
    throw new Error('Could not connect to YouTube API. The access token might be invalid or expired. Please reconnect in settings.');
  }
}

/**
 * Fetches the most viewed video for the authenticated user's YouTube channel.
 * @param userId The internal user ID.
 * @param channelId The YouTube channel ID.
 * @returns An object with the most viewed video's details or a default message.
 */
export async function getMostViewedVideo(userId: string, channelId: string) {
    try {
        const youtube = await getYoutubeClient(userId);
        const response = await youtube.search.list({
            part: ['snippet'],
            channelId: channelId,
            order: 'viewCount',
            maxResults: 1,
            type: ['video']
        });

        const video = response.data.items?.[0];

        if (!video?.snippet) {
            return {
                title: 'No public videos found',
                views: 'N/A'
            };
        }

        const videoStatsResponse = await youtube.videos.list({
            part: ['statistics'],
            id: [video.id!.videoId!]
        });

        const viewCount = videoStatsResponse.data.items?.[0]?.statistics?.viewCount ?? 'N/A';
        
        return {
            title: video.snippet.title,
            views: viewCount !== 'N/A' ? parseInt(viewCount, 10) : 'N/A',
        };

    } catch (error) {
        console.error(`Error fetching most viewed video for ${channelId}:`, error);
        return {
            title: 'Could not fetch video data',
            views: 'N/A'
        };
    }
}
