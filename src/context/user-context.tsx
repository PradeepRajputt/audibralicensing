
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import type { DecodedJWT } from '@/lib/types';

interface UserContextType {
  user: DecodedJWT | null;
  isLoading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DecodedJWT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedJWT>(token);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token:", error);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove('token');
    Cookies.remove('user-data');
    setUser(null);
    router.push('/login');
  }, [router]);

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
