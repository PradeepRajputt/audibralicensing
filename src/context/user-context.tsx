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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128.png");
  const [displayName, setDisplayName] = useState("Sample Creator");
  const [status, setStatusState] = useState<UserStatus>('active');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This runs only on the client, after hydration, to avoid mismatches.
    const storedStatus = localStorage.getItem('user_status') as UserStatus;
    if (storedStatus && ['active', 'suspended', 'deactivated'].includes(storedStatus)) {
      setStatusState(storedStatus);
    }
    setIsHydrated(true);
  }, []);

  const setStatus = (newStatus: UserStatus) => {
    setStatusState(newStatus);
    // Use localStorage to simulate a persistent state change across different
    // parts of the app (e.g., admin action affecting creator dashboard).
    localStorage.setItem('user_status', newStatus);
  };

  const value = { avatarUrl, setAvatarUrl, displayName, setDisplayName, status, setStatus, isHydrated };

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
