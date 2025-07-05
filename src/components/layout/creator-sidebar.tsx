
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
import { signOut } from "firebase/auth";
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';
import React from 'react';

const menuItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: Home },
  { href: '/dashboard/activity', label: 'Activity Feed', icon: Activity },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart, requiresConnection: true },
  { href: '/dashboard/content', label: 'My Content', icon: FileVideo },
  { href: '/dashboard/monitoring', label: 'Web Monitoring', icon: ScanSearch },
  { href: '/dashboard/violations', label: 'Violations', icon: ShieldAlert },
  { href: '/dashboard/reports', label: 'Submit Report', icon: FileText },
  { href: '/dashboard/feedback', label: 'Send Feedback', icon: MessageSquareHeart },
];

export function CreatorSidebar() {
  const pathname = usePathname();
  const { dbUser, loading } = useAuth();
  const [hasUnread, setHasUnread] = React.useState(false);
  
  const channelConnected = !!dbUser?.youtubeChannelId;
  const creatorName = dbUser?.displayName ?? 'Creator';
  const creatorImage = dbUser?.avatar;
  
  React.useEffect(() => {
    if (dbUser?.id) {
        hasUnreadCreatorFeedback(dbUser.id).then(setHasUnread);
    }
  }, [dbUser?.id]);
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            {loading ? (
                <>
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </>
            ) : (
                <NextLink href="/dashboard/settings" className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={creatorImage ?? undefined} alt={creatorName ?? 'Creator'} data-ai-hint="profile picture" />
                        <AvatarFallback>{creatorName?.charAt(0) ?? 'C'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sidebar-foreground truncate">{creatorName}</span>
                        <span className="text-xs text-sidebar-foreground/70">Creator Dashboard</span>
                    </div>
                </NextLink>
            )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-4">
          {menuItems.map((item) => {
            const disabled = item.requiresConnection && !channelConnected;
            const isActive = pathname === item.href || (pathname === '/dashboard' && item.href === '/dashboard/overview');
            return (
              <SidebarMenuItem 
                key={item.href}
                notification={item.href === '/dashboard/feedback' ? hasUnread : false}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={disabled ? `${item.label} (Connect YouTube)` : item.label}
                  disabled={disabled}
                >
                  <NextLink href={item.href} prefetch={false}>
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
           <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => signOut(auth)}
            >
                <LogOut />
                <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
