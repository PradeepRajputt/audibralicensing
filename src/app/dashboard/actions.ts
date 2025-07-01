
'use server';

import { google } from 'googleapis';
import { subDays, format } from 'date-fns';
import { getUserById } from '@/lib/users-store';
import type { User, UserAnalytics } from '@/lib/types';

/**
 * Fetches dashboard data.
 * NOTE: This function now returns mock data to avoid YouTube API quota issues during development.
 * The original API call logic is commented out below for reference.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData() {
  const userId = "user_creator_123";
  const user = await getUserById(userId);
  const finalChannelId = user?.youtubeChannelId;

  // If no channel is connected, return the basic user info.
  if (!finalChannelId) {
      console.log('YouTube Channel ID is not configured for the user. Showing connect prompt.');
      return { analytics: null, activity: [], creatorName: user?.displayName, creatorImage: user?.avatar };
  }

  // --- MOCK DATA SECTION ---
  // Return realistic mock data to avoid hitting API quotas during development.
  console.log(`Returning mock data for channel ID: ${finalChannelId}`);

  const mockAnalytics: UserAnalytics = {
    subscribers: 124567,
    views: 9876543,
    mostViewedVideo: {
      title: 'My Most Epic Adventure Yet!',
      views: 1200345
    },
    dailyData: Array.from({ length: 90 }, (_, i) => {
        const date = subDays(new Date(), 89 - i);
        // Simulate non-linear growth, making recent days more active
        const dayFactor = (i + 1) / 90; // Ramps from 0 to 1
        const randomFactor = 0.8 + Math.random() * 0.4; // Fluctuation
        
        const dailyViews = Math.max(0, Math.floor((1500000 / 90) * dayFactor * randomFactor * 1.5));
        const dailySubscribers = Math.max(0, Math.floor((12000 / 200) * dayFactor * randomFactor + Math.random() * 5));
        return {
          date: format(date, 'yyyy-MM-dd'),
          views: dailyViews,
          subscribers: dailySubscribers,
        };
    }),
  };

  const mockActivity = [
    {
      type: "New Infringement Detected",
      details: "On website 'stolencontent.com/my-video'",
      status: "Action Required",
      date: `1 hour ago`,
      variant: "destructive"
    },
    {
      type: "YouTube Scan Complete",
      details: `Channel '${user?.displayName || 'Your Channel'}' scanned.`,
      status: "No Issues",
      date: "1 day ago",
      variant: "default"
    },
  ] as const;

  return { 
    analytics: mockAnalytics, 
    activity: mockActivity, 
    creatorName: user?.displayName, 
    creatorImage: user?.avatar 
  };
  // --- END MOCK DATA SECTION ---

  /*
  // --- ORIGINAL YOUTUBE API LOGIC (COMMENTED OUT) ---
  if (!process.env.YOUTUBE_API_KEY) {
    console.log('YouTube API Key is not configured. This is an expected state if a channel is not yet connected.');
    return { analytics: null, activity: [], creatorName: user?.displayName, creatorImage: user?.avatar };
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

    const analytics: UserAnalytics = {
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

    return { analytics, activity, creatorName: user?.displayName, creatorImage: user?.avatar };
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    // If API call fails, return a consistent structure. UI will handle the null analytics.
    return { analytics: null, activity: [], creatorName: user?.displayName, creatorImage: user?.avatar };
  }
  */
}
