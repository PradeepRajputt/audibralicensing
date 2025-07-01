
'use server';

import { google } from 'googleapis';
import { subDays, format } from 'date-fns';
import { getUserById } from '@/lib/users-store';
import type { User, UserAnalytics } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Fetches dashboard data.
 * NOTE: This function now returns mock data to avoid YouTube API quota issues during development.
 * The original API call logic is commented out below for reference.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData() {
  noStore(); // Prevents caching of this data fetch across requests
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
}
