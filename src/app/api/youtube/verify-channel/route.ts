import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { channelId } = await req.json();
  if (!channelId) return Response.json({ error: 'Missing channelId' }, { status: 400 });
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY is missing');
    return Response.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 500 });
  }

  // 1. Fetch channel details and statistics
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
  let channelRes, channelData;
  try {
    channelRes = await fetch(channelUrl);
    if (!channelRes.ok) {
      const text = await channelRes.text();
      console.error('YouTube API error:', text);
      return Response.json({ error: 'Failed to fetch from YouTube (channels)' }, { status: 500 });
    }
    channelData = await channelRes.json();
  } catch (err) {
    console.error('Fetch error (channels):', err);
    return Response.json({ error: 'Network error fetching channel' }, { status: 500 });
  }
  if (!channelData.items || !channelData.items.length) {
    console.error('Channel not found for ID:', channelId);
    return Response.json({ error: 'Channel not found' }, { status: 404 });
  }
  const channel = channelData.items[0];

  // 2. Fetch videos and find the most viewed
  const videosUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=id&order=viewCount&maxResults=10&type=video`;
  let videosRes, videosData;
  try {
    videosRes = await fetch(videosUrl);
    videosData = await videosRes.json();
  } catch (err) {
    console.error('Fetch error (videos):', err);
    videosData = {};
  }
  let mostViewedVideo = null;
  if (videosData.items && videosData.items.length) {
    // Fetch video details for the top video
    const topVideoId = videosData.items[0].id.videoId;
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${topVideoId}&key=${apiKey}`;
    try {
      const videoDetailsRes = await fetch(videoDetailsUrl);
      const videoDetailsData = await videoDetailsRes.json();
      if (videoDetailsData.items && videoDetailsData.items.length) {
        const v = videoDetailsData.items[0];
        mostViewedVideo = {
          id: v.id,
          title: v.snippet.title,
          thumbnail: v.snippet.thumbnails?.medium?.url || '',
          url: `https://www.youtube.com/watch?v=${v.id}`,
          viewCount: v.statistics.viewCount,
        };
      }
    } catch (err) {
      console.error('Fetch error (video details):', err);
    }
  }

  return Response.json({
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnail: channel.snippet.thumbnails?.default?.url || '',
    url: `https://www.youtube.com/channel/${channel.id}`,
    subscriberCount: channel.statistics.subscriberCount,
    viewCount: channel.statistics.viewCount,
    mostViewedVideo,
  });
} 