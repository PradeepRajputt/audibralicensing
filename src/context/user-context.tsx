
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
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
  const pathname = usePathname();
  
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    const isAdminRoute = pathname.startsWith('/admin');
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
  }, [pathname]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    setUser(null); // Clear user state
    router.push('/'); // Redirect to landing page
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
