
'use client';

import * as React from 'react';

type YouTubeContextType = {
  isYouTubeConnected: boolean;
  setIsYouTubeConnected: (isConnected: boolean) => void;
  channelId: string | null;
  setChannelId: (id: string | null) => void;
};

const YouTubeContext = React.createContext<YouTubeContextType | null>(null);

export function YouTubeProvider({ children }: { children: React.ReactNode }) {
  const [isYouTubeConnected, setIsYouTubeConnected] = React.useState(false);
  const [channelId, setChannelIdState] = React.useState<string | null>(null);

  // Check local storage for connection status on initial load
  React.useEffect(() => {
    const storedStatus = localStorage.getItem('youtube_connected');
    const storedId = localStorage.getItem('youtube_channel_id');
    if (storedStatus === 'true' && storedId) {
      setIsYouTubeConnected(true);
      setChannelIdState(storedId);
    }
  }, []);

  const handleSetIsConnected = (isConnected: boolean) => {
    localStorage.setItem('youtube_connected', String(isConnected));
    setIsYouTubeConnected(isConnected);
    if (!isConnected) {
        localStorage.removeItem('youtube_channel_id');
        setChannelIdState(null);
    }
  }

  const handleSetChannelId = (id: string | null) => {
      if (id) {
        localStorage.setItem('youtube_channel_id', id);
      } else {
        localStorage.removeItem('youtube_channel_id');
      }
      setChannelIdState(id);
  }

  return (
    <YouTubeContext.Provider value={{ isYouTubeConnected, setIsYouTubeConnected: handleSetIsConnected, channelId, setChannelId: handleSetChannelId }}>
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
