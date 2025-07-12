
'use client';

import * as React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useDashboardData } from '@/app/dashboard/dashboard-context';

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;
  const creatorName = user?.youtubeChannel?.title || user?.displayName || user?.name || 'Creator';
  const avatar = user?.avatar;
  const avatarFallback = creatorName ? creatorName.charAt(0) : 'C';

  let sidebarCollapsed = false;
  try {
    const sidebar = useSidebar();
    sidebarCollapsed = sidebar.state === 'collapsed';
  } catch {}

  // Profile Glow Logic
  const [showGlow, setShowGlow] = React.useState(false);
  React.useEffect(() => {
    if (avatar && !localStorage.getItem('profileGlowShown')) {
      setShowGlow(true);
      setTimeout(() => {
        setShowGlow(false);
        localStorage.setItem('profileGlowShown', 'true');
      }, 1200); // match animation duration
    }
  }, [avatar]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('creator_jwt');
    }
    signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 transition-all duration-300">
      <SidebarTrigger />
      {(sidebarCollapsed && pathname !== '/dashboard/overview') ? (
        <div className="flex items-center gap-3 transition-all duration-300">
          <Avatar className={`h-8 w-8 transition-all duration-300 ${showGlow ? 'profile-glow' : ''}`}> 
            <AvatarImage src={avatar ?? undefined} alt={creatorName} loading="eager" />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="text-lg font-semibold">{creatorName}</span>
        </div>
      ) : (
        <h1 className="text-xl font-semibold transition-all duration-300">Creator Dashboard</h1>
      )}
      <div className="flex-1" />
    </header>
  );
}
