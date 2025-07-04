'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
        const { data } = await axios.get('/api/auth/user');
        setUser(data.user || null);
    } catch (error) {
        console.error("Failed to fetch user, they are likely not logged in.", error);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch user on client-side routes that are not public
    if (!['/login', '/register', '/'].includes(pathname)) {
        fetchUser();
    } else {
        setIsLoading(false);
    }
  }, [pathname, fetchUser]);

  const logout = useCallback(async () => {
    setUser(null);
    await axios.post('/api/auth/logout');
    router.push('/login');
  }, [router]);
  
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
