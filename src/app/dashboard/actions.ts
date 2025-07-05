
'use server';

import type { User, UserAnalytics, Violation, DashboardData } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays, format } from 'date-fns';
import { getUserById, updateUser } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getViolationsForUser } from '@/lib/violations-store';
import { getChannelStats, getMostViewedVideo } from '@/lib/services/youtube-service';

// MOCK IMPLEMENTATION: Simulates getting the logged-in user's ID.
// In a real app, this would come from a session provider or token.
async function getUserIdFromSession(): Promise<string | null> {
    // For the creator dashboard, we always assume the mock creator is logged in.
    return 'user_creator_123';
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
      user: dbUser,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // If the error is from the YouTube service, we can still return partial data
    const dbUser = await getUserById(userId);
     if (dbUser) {
        return { analytics: null, activity: [], user: dbUser };
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
      return { success: false, message: "Authentication error. Please sign in again."};
  }
  
  const channelId = formData.get("channelId") as string;

  if (!channelId || channelId.trim().length < 5) {
    return {
      success: false,
      message: "Please enter a valid Channel ID.",
    };
  }

  try {
    const channelStats = await getChannelStats(channelId);

    if (!channelStats) {
      return { success: false, message: "Could not find a YouTube channel with that ID." };
    }

    await updateUser(userId, { 
      youtubeChannelId: channelId,
      // You might not want to override name/avatar if they already exist from a social login
      // but for this flow, it makes sense.
      displayName: channelStats.title || "YouTube Creator", 
      avatar: channelStats.avatar, 
      platformsConnected: ['youtube'],
    });

    revalidatePath('/dashboard', 'layout');
    
  } catch (error) {
    console.error("Error verifying youtube channel:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message };
  }

  redirect('/dashboard/analytics');
}

export async function disconnectYoutubeChannelAction() {
    const userId = await getUserIdFromSession();
     if (!userId) {
        return { success: false, message: "Authentication error."};
    }
    
    try {
        await updateUser(userId, {
            youtubeChannelId: undefined,
            avatar: 'https://placehold.co/128x128.png', // Reset avatar
            displayName: 'Sample Creator', // Reset name
            platformsConnected: [] 
        });
        revalidatePath('/dashboard', 'layout');
        return { success: true, message: 'YouTube channel disconnected.' };
    } catch (error) {
        console.error("Failed to disconnect YouTube channel:", error);
        return { success: false, message: 'Failed to disconnect channel.'};
    }
}
