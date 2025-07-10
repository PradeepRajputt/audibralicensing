
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export function DashboardHeader({ title }: { title: string }) {
  const router = useRouter();

  const handleSignOut = () => {
    // Remove JWT for email/password users
    if (typeof window !== 'undefined') {
      localStorage.removeItem('creator_jwt');
    }
    // Try next-auth signOut (for Google users)
    signOut({ redirect: false });
    // Redirect to login page
    router.push('/auth/login');
  };

  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold flex-1">{title}</h1>
        <button
          onClick={handleSignOut}
          className="ml-auto flex items-center gap-2 px-3 py-2 rounded-md bg-destructive text-white hover:bg-destructive/90 transition text-sm font-medium"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
     </header>
  );
}
