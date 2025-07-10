import { NextResponse } from 'next/server';
import { getLatestUploads } from '@/lib/services/youtube-service';

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  url: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get('channelId');
  if (!channelId) {
    return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
  }
  try {
    const videos = await getLatestUploads(channelId);
    return NextResponse.json({ videos });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
