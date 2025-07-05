
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { ScanSearch, FileText, Settings, FileVideo, ShieldAlert, Home, LogOut, BarChart, Activity, MessageSquareHeart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import React from 'react';
import { useAuth } from '@/context/auth-context';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';


const menuItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: Home, requiresConnection: false },
  { href: '/dashboard/activity', label: 'Activity Feed', icon: Activity, requiresConnection: false },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart, requiresConnection: true },
  { href: '/dashboard/content', label: 'My Content', icon: FileVideo, requiresConnection: false },
  { href: '/dashboard/monitoring', label: 'Web Monitoring', icon: ScanSearch, requiresConnection: true },
  { href: '/dashboard/violations', label: 'Violations', icon: ShieldAlert, requiresConnection: true },
  { href: '/dashboard/reports', label: 'Submit Report', icon: FileText, requiresConnection: false },
  { href: '/dashboard/feedback', label: 'Send Feedback', icon: MessageSquareHeart, requiresConnection: false },
];

export function CreatorSidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [hasUnread, setHasUnread] = React.useState(false);
  
  const creatorName = user?.displayName;
  const creatorImage = user?.photoURL;
  const avatarFallback = creatorName ? creatorName.substring(0,2) : 'C';
  const youtubeConnected = !!user?.youtubeChannelId;

  React.useEffect(() => {
    if (user) {
      hasUnreadCreatorFeedback(user.uid).then(setHasUnread);
    }
  }, [pathname, user]);
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            <NextLink href="/dashboard/settings" className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={creatorImage ?? undefined} alt={creatorName ?? 'Creator'} data-ai-hint="profile picture" />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sidebar-foreground truncate">{creatorName}</span>
                    <span className="text-xs text-sidebar-foreground/70">Creator Dashboard</span>
                </div>
            </NextLink>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/dashboard' && item.href === '/dashboard/overview');
            const isDisabled = item.requiresConnection && !youtubeConnected;
            return (
              <SidebarMenuItem 
                key={item.href}
                notification={item.href === '/dashboard/feedback' ? hasUnread : false}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={isDisabled ? `${item.label} (requires YouTube connection)` : item.label}
                  disabled={isDisabled}
                  aria-disabled={isDisabled}
                >
                  <NextLink href={item.href} prefetch={false} className={isDisabled ? "pointer-events-none" : ""}>
                    <item.icon />
                    <span>{item.label}</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-4">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard/settings'}
              tooltip="Settings"
            >
              <NextLink href="/dashboard/settings" prefetch={false}>
                <Settings />
                <span>Settings</span>
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
