
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
import { ScanSearch, FileText, Settings, FileVideo, ShieldAlert, Home, LogOut, BarChart, Activity, MessageSquareHeart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import React from 'react';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';


const menuItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: Home },
  { href: '/dashboard/activity', label: 'Activity Feed', icon: Activity },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
  { href: '/dashboard/content', label: 'My Content', icon: FileVideo },
  { href: '/dashboard/monitoring', label: 'Web Monitoring', icon: ScanSearch },
  { href: '/dashboard/violations', label: 'Violations', icon: ShieldAlert },
  { href: '/dashboard/reports', label: 'Submit Report', icon: FileText },
  { href: '/dashboard/feedback', label: 'Send Feedback', icon: MessageSquareHeart },
];

export function CreatorSidebar() {
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = React.useState(false);

  React.useEffect(() => {
    // Using a mock user ID as auth has been removed
    hasUnreadCreatorFeedback("user_creator_123").then(setHasUnread);
  }, [pathname]);
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            <NextLink href="/dashboard/settings" className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={"https://placehold.co/128x128.png"} data-ai-hint="profile picture" />
                    <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sidebar-foreground truncate">Creator</span>
                    <span className="text-xs text-sidebar-foreground/70">Creator Dashboard</span>
                </div>
            </NextLink>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/dashboard' && item.href === '/dashboard/overview');

            return (
              <SidebarMenuItem 
                key={item.href}
                notification={item.href === '/dashboard/feedback' ? hasUnread : false}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
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
             <SidebarMenuButton asChild tooltip="Home">
                <NextLink href="/" prefetch={false}>
                    <LogOut />
                    <span>Back to Home</span>
                </NextLink>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
