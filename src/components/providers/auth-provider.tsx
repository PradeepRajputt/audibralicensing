
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { getAppUser } from '@/app/actions/user';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signup: (email: string, password: string, displayName: string) => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // User is signed in with Firebase, now fetch our custom user data from a dedicated Server Action
        const appUser = await getAppUser(fbUser.uid);
        setUser(appUser || null);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

   const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Send token to server to create session cookie
      await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
      });
      
      const appUser = await getAppUser(userCredential.user.uid);
      setUser(appUser || null);
      return { user: appUser || null, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
     try {
       const response = await fetch('/api/auth/signup', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password, displayName }),
       });
       const data = await response.json();
       if (!response.ok) {
           throw new Error(data.error || 'Something went wrong');
       }
       // Login the user after successful signup to create a session
       return await login(email, password);
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    // Tell the server to clear the session cookie
    await fetch('/api/auth/session', { method: 'DELETE' });
    setUser(null);
  };
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const value = { user, firebaseUser, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
