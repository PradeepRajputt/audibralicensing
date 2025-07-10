'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useYouTube } from '@/context/youtube-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  url: string;
  thumbnail?: string;
}

const LatestUploadsPage = () => {
  const { channelId } = useYouTube();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cacheRef = useRef<{ [key: string]: YouTubeVideo[] }>({});

  useEffect(() => {
    if (!channelId) return;
    // If videos for this channelId are cached, use them
    if (cacheRef.current[channelId]) {
      setVideos(cacheRef.current[channelId]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      setLoading(false);
      setError('Failed to load videos within 15 seconds. Please try again.');
    }, 15000);
    fetch(`/api/youtube-latest-uploads?channelId=${channelId}`)
      .then(res => res.json())
      .then(data => {
        if (!didTimeout) {
          const withThumbnails = (data.videos || []).map((v: any) => ({
            ...v,
            thumbnail: v.thumbnail || v.thumbnails?.medium?.url || v.thumbnails?.default?.url || v.thumbnails?.high?.url || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
          }));
          setVideos(withThumbnails);
          cacheRef.current[channelId] = withThumbnails;
          setLoading(false);
          clearTimeout(timeout);
        }
      })
      .catch(err => {
        if (!didTimeout) {
          setError('Failed to fetch latest uploads.');
          setLoading(false);
          clearTimeout(timeout);
        }
      });
    return () => clearTimeout(timeout);
  }, [channelId]);

  const handleWebScan = (video: YouTubeVideo) => {
    const params = new URLSearchParams({
      title: video.title,
      url: video.url,
      publishedAt: video.publishedAt,
    });
    router.push(`/dashboard/monitoring?${params.toString()}`);
  };

  if (!channelId) {
    return <div className="p-6 text-base">Connect your YouTube channel to view latest uploads.</div>;
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-10">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <span className="text-base text-gray-700">Loading latest uploads...</span>
    </div>
  );
  if (error) return <div className="p-6 text-red-500 text-base">{error}</div>;

  return (
    <div className="p-2 max-w-full w-full">
      <h1 className="text-xl font-semibold mb-4">Latest Uploads</h1>
      <div className="overflow-x-auto rounded-lg w-full">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-5 py-2 font-medium text-gray-700 text-center">Thumbnail</th>
              <th className="px-5 py-2 font-medium text-gray-700 text-left">Title</th>
              <th className="px-5 py-2 font-medium text-gray-700 text-left">Original URL</th>
              <th className="px-5 py-2 font-medium text-gray-700 text-center">Date</th>
              <th className="px-5 py-2 font-medium text-gray-700 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr
                key={video.id}
                className="transition-colors duration-300 hover:bg-gray-200 align-middle"
                style={{ height: 64 }}
              >
                <td className="px-5 py-2 text-center">
                  <img
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-24 h-14 object-cover rounded mx-auto"
                  />
                </td>
                <td className="px-5 py-2 text-gray-900 max-w-xs truncate" title={video.title}>{video.title}</td>
                <td className="px-5 py-2">
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                    {video.url}
                  </a>
                </td>
                <td className="px-5 py-2 text-center">{new Date(video.publishedAt).toISOString().slice(0, 10)}</td>
                <td className="px-5 py-2 text-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
                    onClick={() => handleWebScan(video)}
                  >
                    Web Scan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LatestUploadsPage; 