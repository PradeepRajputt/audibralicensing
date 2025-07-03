
'use server';

import type { UserAnalytics, Violation, User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays } from 'date-fns';
import { getUserById, updateUser } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import axios from 'axios';
import { getViolationsForUser } from '@/lib/violations-store';


/**
 * Fetches dashboard data.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData() {
  noStore();
  
  const session = await getSession();
  if (!session?.uid) {
      console.log("No session found, returning null.");
      return null;
  }
  
  const userId = session.uid;

  try {
    const user = await getUserById(userId);

    if (!user) {
        console.log(`User with id ${userId} not found.`);
        return null;
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

const fetchYoutubeChannelData = async (channelId: string) => {
    noStore();
    console.log(`Verifying YouTube Channel ID: ${channelId}`);
    
    if (!process.env.YOUTUBE_API_KEY) {
        throw new Error("YouTube API Key is not configured.");
    }
    
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`;
    
    try {
        const response = await axios.get(url);
        if (response.data.items && response.data.items.length > 0) {
            const channel = response.data.items[0];
            return {
                success: true,
                channel: {
                    id: channel.id,
                    name: channel.snippet.title,
                    avatar: channel.snippet.thumbnails.default.url,
                }
            };
        }
        return { success: false, message: 'Invalid or unknown YouTube Channel ID.' };
    } catch (error: any) {
        console.error("Error fetching from YouTube API: ", error.response?.data?.error);
        if (error.response?.data?.error?.message) {
             return { success: false, message: error.response.data.error.message };
        }
        return { success: false, message: 'Failed to communicate with YouTube API.' };
    }
};

const verifyChannelFormSchema = z.object({
  channelId: z.string().min(5, { message: "Please enter a valid Channel ID." }),
});

export async function verifyYoutubeChannel(
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session?.uid) {
      return { success: false, message: "Authentication required." };
  }
  const userId = session.uid;

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
    const youtubeResponse = await fetchYoutubeChannelData(channelId);

    if (!youtubeResponse.success) {
      return { success: false, message: youtubeResponse.message };
    }

    const { channel } = youtubeResponse;

    await updateUser(userId, { 
      youtubeChannelId: channel.id,
      displayName: channel.name,
      avatar: channel.avatar,
      platformsConnected: ['youtube'],
    });

    revalidatePath('/dashboard', 'layout');
    
    return { success: true, message: "YouTube channel connected successfully!", channel };

  } catch (error) {
    console.error("Error verifying youtube channel:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function disconnectYoutubeChannelAction() {
    const session = await getSession();
    if (!session?.uid) {
        return { success: false, message: "Authentication required." };
    }

    try {
        await updateUser(session.uid, {
            youtubeChannelId: undefined,
            platformsConnected: [] // Assuming only one platform for now
        });
        revalidatePath('/dashboard', 'layout');
        return { success: true, message: 'YouTube channel disconnected.' };
    } catch (error) {
        return { success: false, message: 'Failed to disconnect channel.'}
    }
}
