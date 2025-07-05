
'use client';

import * as React from 'react';

type YouTubeContextType = {
  isYouTubeConnected: boolean;
  setIsYouTubeConnected: (isConnected: boolean) => void;
};

const YouTubeContext = React.createContext<YouTubeContextType | null>(null);

export function YouTubeProvider({ children }: { children: React.ReactNode }) {
  const [isYouTubeConnected, setIsYouTubeConnected] = React.useState(false);

  return (
    <YouTubeContext.Provider value={{ isYouTubeConnected, setIsYouTubeConnected }}>
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
