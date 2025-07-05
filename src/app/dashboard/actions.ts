
'use server';

import type { User, UserAnalytics, Violation, DashboardData } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays } from 'date-fns';
import { getUserById } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { getViolationsForUser } from '@/lib/violations-store';
import { getChannelStats, getMostViewedVideo } from '@/lib/services/youtube-service';

/**
 * Fetches dashboard data for a given user ID.
 * @param userId The ID of the user.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData(userId?: string): Promise<DashboardData | null> {
  noStore();
  
  // Since auth is removed, we'll use a mock user ID but structure it to be easily adaptable.
  const effectiveUserId = userId || 'user_creator_123';

  try {
    const dbUser = await getUserById(effectiveUserId);

    if (!dbUser) {
        console.log(`User with id ${effectiveUserId} not found.`);
        return null;
    }
    
    let userAnalytics: UserAnalytics | null = null;
    if (dbUser.youtubeChannelId) {
        try {
            const stats = await getChannelStats(dbUser.youtubeChannelId);
            
            if (stats) {
                 const mostViewed = await getMostViewedVideo(dbUser.youtubeChannelId);
                
                userAnalytics = {
                    subscribers: stats.subscribers,
                    views: stats.views,
                    mostViewedVideo: mostViewed,
                     // Generate plausible daily data based on real totals for chart visualization
                    dailyData: Array.from({ length: 90 }, (_, i) => {
                        const date = subDays(new Date(), 89 - i);
                        // Simulate a growth trend
                        const dayFactor = (i + 1) / 90;
                        const randomFactor = 0.8 + Math.random() * 0.4;
                        const dailyViews = Math.max(0, Math.floor((stats.views / 90) * dayFactor * randomFactor * 1.5));
                        const dailySubscribers = Math.max(0, Math.floor((stats.subscribers / 200) * dayFactor * randomFactor + Math.random() * 5));
                        return {
                            date: date.toISOString().split('T')[0],
                            views: dailyViews,
                            subscribers: dailySubscribers,
                        };
                    }),
                }
            }
        } catch (error) {
            console.warn("Could not fetch YouTube analytics. This might be due to an invalid API key or channel ID.", error);
            // Don't fail the whole dashboard, just show analytics as null
            userAnalytics = null;
        }
    }


    const violations = await getViolationsForUser(effectiveUserId);
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
          date: new Date(violation.detectedAt).toISOString(),
          variant
      };
    });

    return { 
      analytics: userAnalytics, 
      activity: activity, 
      user: JSON.parse(JSON.stringify(dbUser)),
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    const dbUser = await getUserById(effectiveUserId);
     if (dbUser) {
        return { analytics: null, activity: [], user: JSON.parse(JSON.stringify(dbUser)) };
     }
    return null;
  }
}
