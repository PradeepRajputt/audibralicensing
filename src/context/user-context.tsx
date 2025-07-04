
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { DecodedJWT } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Hardcoded mock users for testing without a database
const mockCreator: DecodedJWT = {
    id: 'user_creator_123',
    email: 'creator@example.com',
    displayName: 'Sample Creator',
    role: 'creator',
    avatar: 'https://placehold.co/128x128.png',
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
};

const mockAdmin: DecodedJWT = {
    id: 'user_admin_123',
    email: 'admin@creatorshield.com',
    displayName: 'Admin User',
    role: 'admin',
    avatar: 'https://placehold.co/128x128.png',
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
};


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
  
  useEffect(() => {
    // Determine which user to mock based on the URL path for easy testing
    if (pathname.startsWith('/admin')) {
      setUser(mockAdmin);
    } else if (pathname.startsWith('/dashboard')) {
      setUser(mockCreator);
    } else {
        setUser(null); // No user on landing/login/register pages
    }
    setIsLoading(false);
  }, [pathname]);

  const logout = useCallback(async () => {
    // Simulate logout
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
