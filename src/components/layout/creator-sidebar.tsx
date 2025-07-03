
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
import { Skeleton } from '@/components/ui/skeleton';
import { ScanSearch, FileText, Settings, FileVideo, ShieldAlert, Home, LogOut, BarChart, Link as LinkIcon, MessageSquareHeart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import type { User } from '@/lib/types';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/overview', label: 'Quick Links', icon: LinkIcon },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart, requiresConnection: true },
  { href: '/dashboard/content', label: 'My Content', icon: FileVideo },
  { href: '/dashboard/monitoring', label: 'Web Monitoring', icon: ScanSearch },
  { href: '/dashboard/violations', label: 'Violations', icon: ShieldAlert },
  { href: '/dashboard/reports', label: 'Submit Report', icon: FileText },
  { href: '/dashboard/feedback', label: 'Send Feedback', icon: MessageSquareHeart },
];

export function CreatorSidebar({ hasUnreadFeedback, channelConnected, user }: { hasUnreadFeedback: boolean, channelConnected: boolean, user: User | undefined }) {
  const pathname = usePathname();
  const creatorName = user?.displayName ?? 'Creator';
  const creatorImage = user?.avatar;
  const isLoading = !user;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            {isLoading ? (
                <>
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </>
            ) : (
                <>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={creatorImage ?? undefined} alt={creatorName ?? 'Creator'} data-ai-hint="profile picture" />
                        <AvatarFallback>{creatorName?.charAt(0) ?? 'C'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sidebar-foreground truncate">{creatorName || 'CreatorShield'}</span>
                        <span className="text-xs text-sidebar-foreground/70">Creator Dashboard</span>
                    </div>
                </>
            )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-4">
          {menuItems.map((item) => {
            const disabled = item.requiresConnection && !channelConnected;
            return (
              <SidebarMenuItem 
                key={item.href}
                notification={item.href === '/dashboard/feedback' ? hasUnreadFeedback : false}
              >
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
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
              asChild
              tooltip="Logout"
            >
              <NextLink href="/">
                <LogOut />
                <span>Logout</span>
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
