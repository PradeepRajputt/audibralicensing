
'use server';

import { revalidatePath } from 'next/cache';
import { getChannelStats } from '@/lib/services/youtube-service';
import { getUserByEmail, updateUser } from '@/lib/users-store';

export async function connectYouTubeChannelAction(channelId: string, userEmail: string) {
  try {
    console.log('🔍 Connecting YouTube channel:', channelId, 'for user:', userEmail);
    
    const stats = await getChannelStats(channelId);
    console.log('📊 YouTube stats:', stats);
    
    if (!stats) {
      return { success: false, message: "Could not find a YouTube channel with that ID. Please check and try again." };
    }

    const user = await getUserByEmail(userEmail);
    console.log('👤 Found user:', user);
    console.log('🆔 User ID type:', typeof user.id, 'Value:', user.id);
    
    if (!user) {
       return { success: false, message: "Could not find user to update." };
    }
    
    const updateData = { 
      youtubeChannel: {
        id: channelId,
        title: stats.title || user.displayName,
        thumbnail: stats.avatar || user.avatar,
        url: stats.url // <-- Add url property
      },
      youtubeChannelId: channelId, // Save channel ID separately for easy querying
      displayName: stats.title || user.displayName, // Update user display name from YouTube
      avatar: stats.avatar || user.avatar // Update avatar from YouTube
    };
    
    console.log('🔄 Updating user with data:', updateData);
    
    // Update the user's record with the new channel info
    const updateResult = await updateUser(user._id.toString(), updateData);
    console.log('✅ Update result:', updateResult);

    // Verify the update by fetching the user again
    const updatedUser = await getUserByEmail(userEmail);
    console.log('🔄 Updated user data:', updatedUser);

    // Force revalidation of all relevant paths
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin/users', 'page');
    revalidatePath('/admin/overview', 'page');
    revalidatePath('/dashboard/settings', 'page');

    return { success: true, message: `Successfully connected to channel: ${stats.title}` };

  } catch (error) {
    console.error("❌ Error connecting YouTube channel:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    if (message.includes("404")) {
      return { success: false, message: "Could not find a YouTube channel with that ID. Please check it and try again." };
    }
    return { success: false, message: "An error occurred while connecting to YouTube." };
  }
}
