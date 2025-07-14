
'use server';

import type { User, UserAnalytics, Violation, DashboardData } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays, format } from 'date-fns';
import { getUserById, getUserByEmail } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { getViolationsForUser } from '@/lib/violations-store';
import { getChannelStats, getMostViewedVideo } from '@/lib/services/youtube-service';

/**
 * Fetches dashboard data for a given user ID.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData(userEmail?: string): Promise<DashboardData | null> {
  noStore();
  if (!userEmail) return null;
  const dbUser = await getUserByEmail(userEmail);
  if (!dbUser) return null;

  try {
    if (!dbUser) {
        console.log(`User not found.`);
        return null;
    }
    
    let userAnalytics: UserAnalytics | null = null;
    const channelId = dbUser.youtubeChannel?.id || dbUser.youtubeChannelId;
    if (channelId) {
        try {
            const stats = await getChannelStats(channelId);
            if (stats) {
                 const mostViewed = await getMostViewedVideo(channelId);
                userAnalytics = {
                    subscribers: stats.subscribers,
                    views: stats.views,
                    mostViewedVideo: {
                        title: mostViewed.title || undefined,
                        views: mostViewed.views
                    },
                    // Generate a realistic, monotonic daily time series
                    dailyData: Array.from({ length: 90 }, (_, i) => {
                        const date = subDays(new Date(), 89 - i);
                        // Distribute views and subscribers linearly with a slight curve
                        const progress = (i + 1) / 90;
                        // Use a quadratic curve for a more natural growth
                        const curve = Math.pow(progress, 1.2);
                        const dailyViews = Math.round((stats.views * curve - stats.views * Math.pow((i) / 90, 1.2)));
                        const dailySubscribers = Math.round((stats.subscribers * curve - stats.subscribers * Math.pow((i) / 90, 1.2)));
                        return {
                            date: format(date, 'yyyy-MM-dd'),
                            views: Math.max(0, dailyViews),
                            subscribers: Math.max(0, dailySubscribers),
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

    const violations = await getViolationsForUser(dbUser.id);
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
    if (dbUser) {
        return { analytics: null, activity: [], user: JSON.parse(JSON.stringify(dbUser)) };
    }
    return null;
  }
}
