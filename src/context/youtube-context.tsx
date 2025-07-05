
'use client';

import * as React from 'react';

type YouTubeContextType = {
  isYouTubeConnected: boolean;
  setIsYouTubeConnected: (isConnected: boolean) => void;
};

const YouTubeContext = React.createContext<YouTubeContextType | null>(null);

export function YouTubeProvider({ children }: { children: React.ReactNode }) {
  const [isYouTubeConnected, setIsYouTubeConnected] = React.useState(false);

  // Check local storage for connection status on initial load
  React.useEffect(() => {
    const storedStatus = localStorage.getItem('youtube_connected');
    if (storedStatus === 'true') {
      setIsYouTubeConnected(true);
    }
  }, []);

  const handleSetIsConnected = (isConnected: boolean) => {
    localStorage.setItem('youtube_connected', String(isConnected));
    setIsYouTubeConnected(isConnected);
  }

  return (
    <YouTubeContext.Provider value={{ isYouTubeConnected, setIsYouTubeConnected: handleSetIsConnected }}>
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
