
'use server';

import { getViolationsForUser } from '@/lib/violations-store';
import type { UserAnalytics, Violation } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays } from 'date-fns';
import { cookies } from 'next/headers';
import { admin } from '@/lib/firebase-admin';
import { getUserById } from '@/lib/users-store';

/**
 * Fetches dashboard data.
 * NOTE: This function now returns mock data for analytics to avoid YouTube API quota issues during development,
 * but fetches real activity data from the violations store.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData() {
  noStore();
  
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;
    const user = await getUserById(userId);
    
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
          const dayFactor = (i + 1) / 90;
          const randomFactor = 0.8 + Math.random() * 0.4;
          const dailyViews = Math.max(0, Math.floor((1500000 / 90) * dayFactor * randomFactor * 1.5));
          const dailySubscribers = Math.max(0, Math.floor((12000 / 200) * dayFactor * randomFactor + Math.random() * 5));
          return {
            date: date.toISOString().split('T')[0],
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
          case 'pending_review': status = 'Action Required'; variant = 'destructive'; break;
          case 'action_taken': status = 'Reported'; variant = 'default'; break;
          case 'dismissed': status = 'Ignored'; variant = 'secondary'; break;
          default: status = 'Unknown'; variant = 'outline';
      }
      return {
          type: "Infringement Detected",
          details: `On ${violation.platform}: ${violation.matchedURL}`,
          status,
          date: new Date(violation.detectedAt).toLocaleDateString(),
          variant
      };
    });

    return { 
      analytics: user?.youtubeChannelId ? mockAnalytics : null, 
      activity: activity, 
      user: user,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}
