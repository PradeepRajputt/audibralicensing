'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128.png");
  const [displayName, setDisplayName] = useState("Sample Creator");

  const value = { avatarUrl, setAvatarUrl, displayName, setDisplayName };

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
