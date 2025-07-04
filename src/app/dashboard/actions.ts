
'use server';

import type { UserAnalytics, Violation, User, DashboardData } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays, format } from 'date-fns';
import { getUserById, updateUser } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getViolationsForUser } from '@/lib/violations-store';
import { getChannelStats, getMostViewedVideo } from '@/lib/services/youtube-service';

// MOCKED USER ID for prototype purposes
const MOCK_USER_ID = 'user_creator_123';

/**
 * Fetches dashboard data.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  noStore();
  
  const userId = MOCK_USER_ID;

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

const verifyChannelFormSchema = z.object({
  channelId: z.string().min(5, { message: "Please enter a valid Channel ID." }),
});

export async function verifyYoutubeChannel(
  prevState: any,
  formData: FormData
) {
  const userId = MOCK_USER_ID;

  const validatedFields = verifyChannelFormSchema.safeParse({
    channelId: formData.get("channelId"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.flatten().fieldErrors.channelId?.join(', '),
    };
  }
  
  const { channelId } = validatedFields.data;

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
    const userId = MOCK_USER_ID;
    
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
