
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/users-store';
import { Loader2 } from 'lucide-react';

// MOCK USER IDs
const CREATOR_ID = 'user_creator_123';
const ADMIN_ID = 'user_admin_123';


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
    let userId: string | null = null;
    
    if (pathname.startsWith('/admin')) {
      userId = ADMIN_ID;
    } else if (pathname.startsWith('/dashboard')) {
      userId = CREATOR_ID;
    }

    if (userId) {
      // Fetch user from the store, which will have the latest data
      const userData = await getUserById(userId);
      setUser(userData || null);
    } else {
        setUser(null);
    }
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    // Simulate logout
    setUser(null);
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
