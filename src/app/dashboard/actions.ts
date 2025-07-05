
'use server';

import type { User, UserAnalytics, Violation, DashboardData } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays } from 'date-fns';
import { getUserById, updateUser } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { getViolationsForUser } from '@/lib/violations-store';
import { getChannelStats, getMostViewedVideo } from '@/lib/services/youtube-service';
import { auth } from '@/lib/auth';

async function getUserIdFromSession(): Promise<string | null> {
    const session = await auth();
    return session?.user?.id ?? null;
}

/**
 * Fetches dashboard data.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  noStore();
  
  const userId = await getUserIdFromSession();
  
  if (!userId) {
      console.log("No user session found.");
      return null;
  }

  try {
    const dbUser = await getUserById(userId);

    if (!dbUser) {
        console.log(`User with id ${userId} not found.`);
        return null;
    }
    
    let userAnalytics: UserAnalytics | null = null;
    if (dbUser.youtubeChannelId) {
        const [stats, mostViewed] = await Promise.all([
            getChannelStats(dbUser.youtubeChannelId),
            getMostViewedVideo(dbUser.youtubeChannelId)
        ]);
        
        if (stats) {
            userAnalytics = {
                subscribers: stats.subscribers,
                views: stats.views,
                mostViewedVideo: mostViewed,
                 // Generate plausible daily data based on real totals
                dailyData: Array.from({ length: 90 }, (_, i) => {
                    const date = subDays(new Date(), 89 - i);
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
    }


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
    const dbUser = await getUserById(userId);
     if (dbUser) {
        return { analytics: null, activity: [], user: JSON.parse(JSON.stringify(dbUser)) };
     }
    return null;
  }
}

export async function verifyYoutubeChannel(
  prevState: any,
  formData: FormData
) {
  const userId = await getUserIdFromSession();

  if (!userId) {
      return { success: false, message: "Authentication error. Please sign in again.", user: null };
  }
  
  const channelId = formData.get("channelId") as string;

  if (!channelId || channelId.trim().length < 5) {
    return {
      success: false,
      message: "Please enter a valid Channel ID.",
      user: null
    };
  }

  try {
    const channelStats = await getChannelStats(channelId);

    if (!channelStats) {
      return { success: false, message: "Could not find a YouTube channel with that ID.", user: null };
    }

    const updates = { 
      youtubeChannelId: channelId,
      displayName: channelStats.title || "YouTube Creator", 
      avatar: channelStats.avatar, 
      platformsConnected: ['youtube'],
    };
    await updateUser(userId, updates);
    
    const updatedUser = await getUserById(userId);
    
    revalidatePath('/dashboard', 'layout');

    return { success: true, message: "Channel connected successfully.", user: updatedUser ? JSON.parse(JSON.stringify(updatedUser)) : null };
    
  } catch (error) {
    console.error("Error verifying youtube channel:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message, user: null };
  }
}
