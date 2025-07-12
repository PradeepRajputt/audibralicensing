'use server';

import dotenv from "dotenv";
dotenv.config();


import { google } from 'googleapis';

const getYouTubeClient = () => {
    console.log("ENV KEY:", process.env.YOUTUBE_API_KEY);

    if (!process.env.YOUTUBE_API_KEY) {
        throw new Error("YouTube API key is not configured.");
    }
    return google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
};


/**
 * Fetches core statistics for a given YouTube channel ID.
 * @returns An object with channel statistics or null if an error occurs.
 */
export async function getChannelStats(channelId: string) {
    console.log(`Fetching stats for channel ID: ${channelId}`);
    const youtube = getYouTubeClient();

    try {
        const response = await youtube.channels.list({
            part: ['snippet', 'statistics'],
            id: [channelId]
        });

        const channel = response.data.items?.[0];

        if (!channel || !channel.statistics || !channel.snippet) {
            console.warn("Could not retrieve channel statistics from YouTube API.");
            return null;
        }

        return {
            id: channel.id!,
            title: channel.snippet.title!,
            avatar: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
            subscribers: parseInt(channel.statistics.subscriberCount!, 10),
            views: parseInt(channel.statistics.viewCount!, 10),
            url: `https://www.youtube.com/channel/${channel.id!}`
        };
    } catch (error) {
        console.error(`Error fetching real channel stats for ${channelId}:`, error);
        throw new Error("Failed to fetch channel statistics from YouTube. Please check the Channel ID.");
    }
}


/**
 * Fetches the most viewed video for a given YouTube channel.
 * @returns An object with the most viewed video's details.
 */
export async function getMostViewedVideo(channelId: string) {
    const youtube = getYouTubeClient();
    
    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            channelId: channelId,
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
        console.error(`Error fetching most viewed video for ${channelId}:`, error);
        throw new Error("Failed to fetch most viewed video.");
    }
}

/**
 * Fetches the 10 latest uploaded videos for a given YouTube channel.
 * @returns An array of video objects with id, title, publishedAt, and url.
 */
export async function getLatestUploads(channelId: string) {
    const youtube = getYouTubeClient();
    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            channelId: channelId,
            order: 'date',
            type: ['video'],
            maxResults: 10
        });
        return (response.data.items || []).map((item: any) => ({
            id: item.id?.videoId || '',
            title: item.snippet?.title || '',
            publishedAt: item.snippet?.publishedAt || '',
            url: item.id?.videoId ? `https://youtube.com/watch?v=${item.id.videoId}` : ''
        }));
    } catch (error) {
        console.error(`Error fetching latest uploads for ${channelId}:`, error);
        throw new Error('Failed to fetch latest uploads.');
    }
}
