
'use client';

import * as React from 'react';
import { useDashboardData } from '@/app/dashboard/dashboard-context';

type YouTubeContextType = {
  isYouTubeConnected: boolean;
  setIsYouTubeConnected: (isConnected: boolean) => void;
  channelId: string | null;
  setChannelId: (id: string | null) => void;
};

const YouTubeContext = React.createContext<YouTubeContextType | null>(null);

export function YouTubeProvider({ children }: { children: React.ReactNode }) {
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;
  const isYouTubeConnected = !!(user?.youtubeChannelId || user?.youtubeChannel?.id);
  const [channelId, setChannelId] = React.useState<string | null>(user?.youtubeChannelId || user?.youtubeChannel?.id || null);

  // setIsYouTubeConnected is now a no-op for compatibility
  const setIsYouTubeConnected = () => {};

  React.useEffect(() => {
    setChannelId(user?.youtubeChannelId || user?.youtubeChannel?.id || null);
  }, [user?.youtubeChannelId, user?.youtubeChannel?.id]);

  return (
    <YouTubeContext.Provider value={{ isYouTubeConnected, setIsYouTubeConnected, channelId, setChannelId }}>
      {children}
    </YouTubeContext.Provider>
  );
}

export function useYouTube() {
  const context = React.useContext(YouTubeContext);
  if (!context) {
    throw new Error('useYouTube must be used within a YouTubeProvider');
  }
  return context;
}
