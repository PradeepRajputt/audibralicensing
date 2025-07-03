
'use server';

import type { UserAnalytics, Violation, User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays } from 'date-fns';
import { getUserById, updateUser } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { getViolationsForUser } from '@/lib/violations-store';
import { DecodedJWT } from '@/lib/types';

/**
 * Fetches dashboard data.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData() {
  noStore();
  
  const token = cookies().get('token')?.value;
  if (!token) {
    console.log("No session found, returning null.");
    return null;
  }
  
  let decoded: DecodedJWT;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedJWT;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }

  const userId = decoded.id;

  try {
    const dbUser = await getUserById(userId);

    if (!dbUser) {
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
      analytics: dbUser.youtubeChannelId ? mockAnalytics : null, 
      activity: activity, 
      user: dbUser,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
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
  const token = cookies().get('token')?.value;
  if (!token) return { success: false, message: 'Authentication required.' };
  
  let decoded: DecodedJWT;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedJWT;
  } catch (e) {
    return { success: false, message: 'Authentication required.' };
  }

  const userId = decoded.id;

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
    // In a real app, this would be a call to the YouTube API.
    // For this prototype, we'll just mock a successful response.
    const youtubeResponse = {
        success: true,
        channel: {
            id: channelId,
            name: "Sample YouTube Channel",
            avatar: "https://placehold.co/128x128/E62117/white?text=YT",
        }
    };

    if (!youtubeResponse.success) {
      return { success: false, message: "Could not verify channel." };
    }

    const { channel } = youtubeResponse;

    await updateUser(userId, { 
      youtubeChannelId: channel.id,
      displayName: channel.name, // Usually you might not want to override this
      avatar: channel.avatar, // Or this
      platformsConnected: ['youtube'],
    });

    revalidatePath('/dashboard', 'layout');
    
  } catch (error) {
    console.error("Error verifying youtube channel:", error);
    return { success: false, message: "An unexpected error occurred." };
  }

  redirect('/dashboard/analytics');
}

export async function disconnectYoutubeChannelAction() {
    const token = cookies().get('token')?.value;
    if (!token) return { success: false, message: 'Authentication required.' };

    let decoded: DecodedJWT;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedJWT;
    } catch (e) {
        return { success: false, message: 'Authentication required.' };
    }
    
    try {
        await updateUser(decoded.id, {
            youtubeChannelId: undefined,
            platformsConnected: [] // Assuming only one platform for now
        });
        revalidatePath('/dashboard', 'layout');
        return { success: true, message: 'YouTube channel disconnected.' };
    } catch (error) {
        console.error("Failed to disconnect YouTube channel:", error);
        return { success: false, message: 'Failed to disconnect channel.'};
    }
}
