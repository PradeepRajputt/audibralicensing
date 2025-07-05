
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/users-store';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // This function will only be created once and won't depend on pathname changes.
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    // Use window.location.pathname for a stable value on the client-side
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const userId = isAdminRoute ? 'user_admin_123' : 'user_creator_123';
    
    try {
        const userData = await getUserById(userId);
        setUser(userData || null);
    } catch (error) {
        console.error("Failed to fetch mock user.", error);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once.

  // This effect runs only once when the component mounts.
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    setUser(null); // Clear user state
    router.push('/'); // Redirect to landing page
  }, [router]);
  
  // The value provided by the context. refetchUser is the same as fetchUser.
  const value = { user, isLoading, logout, refetchUser: fetchUser };

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
