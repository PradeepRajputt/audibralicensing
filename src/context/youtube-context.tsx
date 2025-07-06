
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
  const [channelId, setChannelId] = React.useState<string | null>(null);

  // The connection state is now transient and will reset on page refresh.
  // We removed the localStorage logic to address the issue of the connection
  // persisting across sessions.

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
