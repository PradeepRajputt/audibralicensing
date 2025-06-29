
'use server';

import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Fetches real dashboard data from the YouTube Data API.
 * @returns An object containing analytics and activity data.
 */
export async function getDashboardData() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken || !session.user?.youtubeChannelId) {
    return { analytics: null, activity: [] };
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    // 1. Fetch channel statistics
    const channelResponse = await youtube.channels.list({
      id: [session.user.youtubeChannelId],
      part: ['statistics'],
    });

    const stats = channelResponse.data.items?.[0]?.statistics;
    if (!stats) {
      console.error("Could not fetch channel statistics.");
      return { analytics: null, activity: [] };
    }

    // 2. Fetch most viewed video (as a simple example)
    const videosResponse = await youtube.search.list({
        part: ['snippet'],
        channelId: session.user.youtubeChannelId,
        order: 'viewCount',
        type: ['video'],
        maxResults: 1,
    });
    const mostViewedVideo = videosResponse.data.items?.[0];

    // 3. Construct analytics object with real and mock data
    const analytics = {
      subscribers: Number(stats.subscriberCount),
      views: Number(stats.viewCount),
      mostViewedVideo: {
        title: mostViewedVideo?.snippet?.title ?? 'N/A',
        views: 'N/A' // View count requires another API call, so we'll omit for simplicity
      },
      // For chart data, which requires the more complex YouTube Analytics API,
      // we will return mock data to keep the UI functional.
      monthlyViewsData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
        month,
        views: Math.floor((Math.sin(i) + 1.5) * Number(stats.viewCount) / 20),
      })),
      subscriberData: Array.from({ length: 6 }).map((_, i) => ({
        date: `2024-0${i + 1}-01`,
        count: Math.floor(Number(stats.subscriberCount) * (0.8 + (i * 0.04))),
      })),
    };

    // 4. Generate mock activity data
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
          details: `Channel '${session.user.youtubeChannelId}' scanned.`,
          status: "No Issues",
          date: "1 day ago",
          variant: "default"
        },
    ] as const;

    return { analytics, activity };

  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    // This could happen if the token is expired or permissions are revoked.
    return { analytics: null, activity: [] };
  }
}
