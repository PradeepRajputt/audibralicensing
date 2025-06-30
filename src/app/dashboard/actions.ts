
'use server';

import { google } from 'googleapis';

/**
 * Fetches dashboard data using the public YouTube Data API.
 * It uses the provided channel ID, or falls back to the one in the .env file.
 * @param channelId The optional YouTube channel ID to fetch data for.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData(channelId?: string) {
  const finalChannelId = channelId || process.env.YOUTUBE_CHANNEL_ID;

  if (!process.env.YOUTUBE_API_KEY || !finalChannelId) {
      console.error('YouTube API Key or Channel ID is not configured.');
      // Return null to allow the UI to show a configuration error state.
      return null;
  }
  
  try {
    const youtube = google.youtube({ 
      version: 'v3', 
      auth: process.env.YOUTUBE_API_KEY 
    });

    // 1. Fetch channel statistics
    const channelResponse = await youtube.channels.list({
      id: [finalChannelId],
      part: ['statistics', 'snippet'],
    });

    const channel = channelResponse.data.items?.[0];
    const stats = channel?.statistics;
    if (!stats || !channel?.snippet) {
      throw new Error(`Could not fetch channel statistics or snippet for ID: ${finalChannelId}`);
    }

    // 2. Fetch most viewed video (as a simple example)
    const videosResponse = await youtube.search.list({
        part: ['snippet'],
        channelId: finalChannelId,
        order: 'viewCount',
        type: ['video'],
        maxResults: 1,
    });
    const mostViewedVideo = videosResponse.data.items?.[0];

    // 3. Construct analytics object
    const analytics = {
      subscribers: Number(stats.subscriberCount),
      views: Number(stats.viewCount),
      mostViewedVideo: {
        title: mostViewedVideo?.snippet?.title ?? 'N/A',
        views: 'N/A' // View count requires another API call, so we'll omit for simplicity
      },
      // This data remains simulated for UI demo purposes
      monthlyViewsData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
        month,
        views: Math.floor((Math.sin(i) + 1.5) * Number(stats.viewCount) / 20),
      })),
      subscriberData: Array.from({ length: 6 }).map((_, i) => ({
        date: `2024-0${i + 1}-01`,
        count: Math.floor(Number(stats.subscriberCount) * (0.8 + (i * 0.04))),
      })),
    };

    // 4. Generate some mock activity data
    const activity = [
        {
          type: "New Infringement Detected",
          details: "On website 'stolencontent.com/my-video'",
          status: "Action Required",
          date: `1 hour ago`,
          variant: "destructive"
        },
        {
          type: "YouTube Scan Complete",
          details: `Channel '${channel.snippet.title}' scanned.`,
          status: "No Issues",
          date: "1 day ago",
          variant: "default"
        },
    ] as const;

    return { analytics, activity, creatorName: channel.snippet.title, creatorImage: channel.snippet.thumbnails?.default?.url };
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    // If API call fails, return null. UI will show an error or prompt.
    return null;
  }
}
