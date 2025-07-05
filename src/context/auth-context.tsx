
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { upsertUser } from '@/lib/auth-actions';

interface AuthContextValue {
  user: FirebaseUser | null;
  dbUser: User | null;
  loading: boolean;
  updateDbUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateDbUser = useCallback((updates: Partial<User>) => {
    setDbUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDetails = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
        };
        const updatedDbUser = await upsertUser(userDetails);
        setDbUser(updatedDbUser);
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, dbUser, loading, updateDbUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
