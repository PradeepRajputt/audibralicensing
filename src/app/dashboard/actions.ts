
'use server';

import { getViolationsForUser } from '@/lib/violations-store';
import type { UserAnalytics, Violation, User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays } from 'date-fns';
import { getUserById, updateUser, disconnectYoutubeChannel } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';


/**
 * Fetches dashboard data.
 * NOTE: This function now returns mock data for analytics to avoid YouTube API quota issues during development,
 * but fetches real activity data from the violations store.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData() {
  noStore();
  
  // In a real app, you would get this from the session. For the prototype, we use a fixed ID.
  const userId = "user_creator_123";

  try {
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

// Mock YouTube API call
const mockFetchYoutubeChannelData = async (channelId: string) => {
    console.log(`MOCK: Verifying YouTube Channel ID: ${channelId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (channelId.startsWith("UC") && channelId.length > 10) {
        return {
            success: true,
            channel: {
                id: channelId,
                name: `Sample Channel for ${channelId.slice(2, 8)}`,
                avatar: `https://placehold.co/128x128.png?text=${channelId.slice(2, 4)}`,
            }
        };
    }
    return { success: false, message: 'Invalid or unknown YouTube Channel ID.' };
};

const verifyChannelFormSchema = z.object({
  channelId: z.string().min(5, { message: "Please enter a valid Channel ID." }),
});

export async function verifyYoutubeChannel(
  prevState: any,
  formData: FormData
) {
  // In a real app, this would come from the session.
  const userId = "user_creator_123";

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
    const youtubeResponse = await mockFetchYoutubeChannelData(channelId);

    if (!youtubeResponse.success) {
      return { success: false, message: youtubeResponse.message };
    }

    const { channel } = youtubeResponse;

    await updateUser(userId, { 
      youtubeChannelId: channel.id,
      displayName: channel.name, // Usually you get this from Google OAuth, but we'll use the channel name
      avatar: channel.avatar,
      platformsConnected: ['youtube'],
    });

    revalidatePath('/dashboard', 'layout'); // Revalidate the whole dashboard layout
    
    return { success: true, message: "YouTube channel connected successfully!", channel };

  } catch (error) {
    console.error("Error verifying youtube channel:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function disconnectYoutubeChannelAction() {
    const userId = "user_creator_123";
    try {
        await disconnectYoutubeChannel(userId);
        revalidatePath('/dashboard', 'layout');
        return { success: true, message: 'YouTube channel disconnected.' };
    } catch (error) {
        return { success: false, message: 'Failed to disconnect channel.'}
    }
}
