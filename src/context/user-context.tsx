
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type UserStatus = 'active' | 'suspended' | 'deactivated';

interface UserContextType {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  status: UserStatus;
  setStatus: (status: UserStatus) => void;
  isHydrated: boolean;
  youtubeId: string | null;
  setYoutubeId: (id: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128.png");
  const [displayName, setDisplayName] = useState("Sample Creator");
  const [status, setStatusState] = useState<UserStatus>('active');
  const [youtubeId, setYoutubeIdState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This runs only on the client, after hydration, to avoid mismatches.
    const storedStatus = localStorage.getItem('user_status') as UserStatus;
    if (storedStatus && ['active', 'suspended', 'deactivated'].includes(storedStatus)) {
      setStatusState(storedStatus);
    }
    const storedYoutubeId = localStorage.getItem('youtube_id');
    if (storedYoutubeId) {
        setYoutubeIdState(storedYoutubeId);
    }
    setIsHydrated(true);
  }, []);

  const setStatus = (newStatus: UserStatus) => {
    setStatusState(newStatus);
    localStorage.setItem('user_status', newStatus);
  };

  const setYoutubeId = (newId: string | null) => {
    setYoutubeIdState(newId);
    if (newId) {
        localStorage.setItem('youtube_id', newId);
    } else {
        localStorage.removeItem('youtube_id');
    }
  }

  const value = { avatarUrl, setAvatarUrl, displayName, setDisplayName, status, setStatus, isHydrated, youtubeId, setYoutubeId };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
