
'use server';

import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * Fetches core statistics for a given YouTube channel ID.
 * @param channelId The YouTube channel ID (e.g., UC...).
 * @returns An object with channel statistics or null if not found.
 */
export async function getChannelStats(channelId: string) {
  try {
    const response = await youtube.channels.list({
      id: [channelId],
      part: ['snippet', 'statistics'],
    });

    const channel = response.data.items?.[0];

    if (!channel?.snippet || !channel?.statistics) {
      console.error(`No channel found for ID: ${channelId}`);
      return null;
    }

    return {
      title: channel.snippet.title,
      avatar: channel.snippet.thumbnails?.default?.url,
      subscribers: parseInt(channel.statistics.subscriberCount ?? '0', 10),
      views: parseInt(channel.statistics.viewCount ?? '0', 10),
    };
  } catch (error) {
    const err = error as any;
    console.error(`Error fetching channel stats for ${channelId}:`, err.message);
    if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message);
    }
    throw new Error('Could not connect to YouTube API. Please check the API key.');
  }
}

/**
 * Fetches the most viewed video for a given YouTube channel ID.
 * @param channelId The YouTube channel ID.
 * @returns An object with the most viewed video's details or a default message.
 */
export async function getMostViewedVideo(channelId: string) {
    try {
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

        // To get the exact view count, a separate call to the videos endpoint is needed
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
