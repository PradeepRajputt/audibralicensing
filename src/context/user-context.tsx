
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/users-store';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  channelConnected: boolean;
  logout: () => void;
  updateUserInContext: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // This effect runs only once on initial mount to get the user.
  useEffect(() => {
    const fetchInitialUser = async () => {
        setIsLoading(true);
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const userId = isAdminRoute ? 'user_admin_123' : 'user_creator_123';
        
        try {
            const userData = await getUserById(userId);
            setUser(userData || null);
        } catch (error) {
            console.error("Failed to fetch initial user.", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };
    fetchInitialUser();
  }, []);

  const logout = useCallback(() => {
    setUser(null); 
    router.push('/'); 
  }, [router]);
  
  const updateUserInContext = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);
  
  const channelConnected = !!user?.youtubeChannelId;

  const value = { user, isLoading, logout, updateUserInContext, channelConnected };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

    