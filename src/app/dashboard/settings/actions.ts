
'use server';

import { revalidatePath } from 'next/cache';
import { getChannelStats } from '@/lib/services/youtube-service';
import { getUserByEmail, updateUser } from '@/lib/users-store';

export async function connectYouTubeChannelAction(channelId: string, userEmail: string) {
  try {
    const stats = await getChannelStats(channelId);
    if (!stats) {
      return { success: false, message: "Could not find a YouTube channel with that ID. Please check and try again." };
    }

    const user = await getUserByEmail(userEmail);
    if (!user) {
       return { success: false, message: "Could not find user to update." };
    }
    
    // Update the user's record with the new channel info
    await updateUser(user.id, { 
      youtubeChannel: {
        id: channelId,
        title: stats.title || user.displayName,
        thumbnail: stats.avatar || user.avatar
      },
      displayName: stats.title || user.displayName, // Update user display name from YouTube
      avatar: stats.avatar || user.avatar // Update avatar from YouTube
    });

    revalidatePath('/dashboard', 'layout');

    return { success: true, message: `Successfully connected to channel: ${stats.title}` };

  } catch (error) {
    console.error("Error connecting YouTube channel:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    if (message.includes("404")) {
      return { success: false, message: "Could not find a YouTube channel with that ID. Please check it and try again." };
    }
    return { success: false, message: "An error occurred while connecting to YouTube." };
  }
}
