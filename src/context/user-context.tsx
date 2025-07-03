
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import type { DecodedJWT } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface UserContextType {
  user: DecodedJWT | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DecodedJWT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const syncLogout = useCallback(() => {
    setUser(null);
    if (!['/login', '/register', '/'].includes(pathname)) {
        router.push('/login');
    }
  }, [router, pathname]);


  useEffect(() => {
    try {
        const userDataCookie = Cookies.get('user-data');
        if (userDataCookie) {
            const userData: DecodedJWT = JSON.parse(userDataCookie);
            setUser(userData);
        } else {
            setUser(null);
        }
    } catch (error) {
        console.error("Failed to parse user data from cookie:", error);
        setUser(null);
    }
    setIsLoading(false);

    // Listen for changes in other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'logout-event') {
            syncLogout();
        }
    });

    return () => {
         window.removeEventListener('storage', (e) => {
            if (e.key === 'logout-event') {
                syncLogout();
            }
        });
    }

  }, [syncLogout]);

  const logout = useCallback(async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch(error) {
        console.error("Logout API call failed:", error)
    } finally {
        // Trigger storage event to logout in other tabs
        window.localStorage.setItem('logout-event', Date.now().toString());
        syncLogout();
    }
  }, [syncLogout]);
  
  // Show a global loading spinner if user state is loading, to prevent flicker
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  const value = { user, isLoading, logout };

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
