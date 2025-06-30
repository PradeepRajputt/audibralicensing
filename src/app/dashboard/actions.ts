
'use server';

import { google } from 'googleapis';
import { subDays, format } from 'date-fns';

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

    // 2. Fetch most viewed video ID
    const videosResponse = await youtube.search.list({
        part: ['snippet'],
        channelId: finalChannelId,
        order: 'viewCount',
        type: ['video'],
        maxResults: 1,
    });
    const mostViewedVideo = videosResponse.data.items?.[0];
    const mostViewedVideoId = mostViewedVideo?.id?.videoId;
    
    let mostViewedVideoViews: string | number = 'N/A';
    if (mostViewedVideoId) {
        // 2a. Fetch statistics for the most viewed video to get accurate view count
        const videoStatsResponse = await youtube.videos.list({
            id: [mostViewedVideoId],
            part: ['statistics'],
        });
        const videoStats = videoStatsResponse.data.items?.[0]?.statistics;
        if (videoStats?.viewCount) {
            mostViewedVideoViews = Number(videoStats.viewCount);
        }
    }


    // 3. Construct analytics object with realistic daily data
    const totalViews = Number(stats.viewCount);
    const totalSubs = Number(stats.subscriberCount);
    
    const dailyData: { date: string; views: number; subscribers: number }[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
        const date = subDays(today, i);
        // Simulate non-linear growth, making recent days more active
        const dayFactor = (90 - i) / 90; // Ramps from 0 to 1
        const randomFactor = 0.8 + Math.random() * 0.4; // Fluctuation
        
        const dailyViews = Math.max(0, Math.floor((totalViews / 90) * dayFactor * randomFactor * 1.5));
        const dailySubscribers = Math.max(0, Math.floor((totalSubs / 2000) * dayFactor * randomFactor + Math.random() * 5));

        dailyData.push({
          date: format(date, 'yyyy-MM-dd'),
          views: dailyViews,
          subscribers: dailySubscribers,
        });
    }

    const analytics = {
      subscribers: totalSubs,
      views: totalViews,
      mostViewedVideo: {
        title: mostViewedVideo?.snippet?.title ?? 'N/A',
        views: mostViewedVideoViews
      },
      dailyData,
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
