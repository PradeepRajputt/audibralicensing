
'use server';

import { google, youtube_v3 } from 'googleapis';
import { getUserById } from '../users-store';

const getOauth2Client = async (userId: string) => {
    const user = await getUserById(userId);
    if (!user || !user.accessToken) {
        console.error("No access token found for user:", userId);
        throw new Error("User is not authenticated with YouTube.");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
        access_token: user.accessToken,
    });

    return oauth2Client;
};

const mockChannelStats = {
    id: 'UC-mock-channel-id',
    title: 'Sample Creator',
    avatar: 'https://placehold.co/128x128.png',
    subscribers: 125032,
    views: 15783981,
};

const mockMostViewedVideo = {
    title: 'My Most Viral Video Ever',
    views: 2354871,
};

/**
 * Fetches core statistics for the authenticated user's YouTube channel.
 * @returns An object with channel statistics or null if an error occurs.
 */
export async function getChannelStats(accessToken: string) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn("MOCK MODE: Google credentials not configured. Returning mock channel stats.");
      return mockChannelStats;
    }
  
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    try {
        const response = await youtube.channels.list({
            part: ['snippet', 'statistics'],
            mine: true
        });

        const channel = response.data.items?.[0];

        if (!channel || !channel.statistics || !channel.snippet) {
            console.warn("Could not retrieve channel statistics from YouTube API.");
            return null;
        }

        return {
            id: channel.id!,
            title: channel.snippet.title!,
            avatar: channel.snippet.thumbnails?.default?.url,
            subscribers: parseInt(channel.statistics.subscriberCount!, 10),
            views: parseInt(channel.statistics.viewCount!, 10),
        };
    } catch (error) {
        console.error(`Error fetching real channel stats:`, error);
        // Fallback to mock data in case of API errors during demo
        console.log("Falling back to mock channel stats due to API error.");
        return mockChannelStats;
    }
}


/**
 * Fetches the most viewed video for the authenticated user's YouTube channel.
 * @returns An object with the most viewed video's details.
 */
export async function getMostViewedVideo(accessToken: string) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn("MOCK MODE: Google credentials not configured. Returning mock video data.");
        return mockMostViewedVideo;
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
    });
    
    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            forMine: true,
            order: 'viewCount',
            type: ['video'],
            maxResults: 1
        });
        
        const mostViewed = response.data.items?.[0];
        if (!mostViewed || !mostViewed.id?.videoId) {
            return { title: "No videos found", views: 0 };
        }

        const videoDetails = await youtube.videos.list({
            part: ['statistics'],
            id: [mostViewed.id.videoId]
        });

        const views = videoDetails.data.items?.[0]?.statistics?.viewCount;

        return {
            title: mostViewed.snippet?.title,
            views: views ? parseInt(views, 10) : 'N/A'
        };

    } catch (error) {
        console.error(`Error fetching real most viewed video:`, error);
        console.log("Falling back to mock video data due to API error.");
        return mockMostViewedVideo;
    }
}
