
'use server';

import { subDays, format, formatDistanceToNow } from 'date-fns';
import { getUserById } from '@/lib/users-store';
import { getViolationsForUser } from '@/lib/violations-store';
import type { UserAnalytics, Violation } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Fetches dashboard data.
 * NOTE: This function now returns mock data for analytics to avoid YouTube API quota issues during development,
 * but fetches real activity data from the violations store.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData() {
  noStore();
  // In a real app, this would come from the session.
  const userId = "user_creator_123";
  const user = await getUserById(userId);
  const finalChannelId = user?.youtubeChannelId;

  // If no channel is connected, return the basic user info.
  if (!finalChannelId) {
      console.log('YouTube Channel ID is not configured for the user.');
      return { analytics: null, activity: [], creatorName: user?.displayName, creatorImage: user?.avatar };
  }

  // --- MOCK ANALYTICS SECTION (as a real implementation requires deeper API integration) ---
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

  // --- REAL ACTIVITY DATA SECTION ---
  const violations = await getViolationsForUser(userId);
  const activity = violations.slice(0, 5).map((violation: Violation) => {
    let status: string;
    let variant: 'destructive' | 'default' | 'secondary' | 'outline';

    switch (violation.status) {
        case 'pending_review':
            status = 'Action Required';
            variant = 'destructive';
            break;
        case 'action_taken':
            status = 'Reported';
            variant = 'default';
            break;
        case 'dismissed':
            status = 'Ignored';
            variant = 'secondary';
            break;
        default:
            status = 'Unknown';
            variant = 'outline';
    }
    return {
        type: "Infringement Detected",
        details: `On ${violation.platform}: ${violation.matchedURL}`,
        status,
        date: formatDistanceToNow(new Date(violation.detectedAt), { addSuffix: true }),
        variant
    };
  });


  return { 
    analytics: mockAnalytics, 
    activity: activity, 
    creatorName: user?.displayName, 
    creatorImage: user?.avatar 
  };
}
