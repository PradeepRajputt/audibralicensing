
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
import { Shield, Users, Gavel, Settings, UserCheck, BarChart, MessageSquareQuote } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { hasUnrepliedAdminFeedback } from '@/lib/feedback-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminProfile } from '@/app/admin/profile-context';

const menuItems = [
  { href: '/admin/overview', label: 'Overview', icon: BarChart },
  { href: '/admin/users', label: 'Creator Management', icon: Users },
  { href: '/admin/strikes', label: 'Strike Requests', icon: Gavel },
  { href: '/admin/reactivations', label: 'Reactivation Requests', icon: UserCheck },
  { href: '/admin/feedback', label: 'Creator Feedback', icon: MessageSquareQuote },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [hasNewFeedback, setHasNewFeedback] = React.useState(false);

  React.useEffect(() => {
    hasUnrepliedAdminFeedback().then(setHasNewFeedback);
  }, [pathname]); // Re-check on navigation

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarProfileHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-4">
          {menuItems.map((item) => (
            <SidebarMenuItem 
              key={item.href}
              notification={item.href === '/admin/feedback' ? hasNewFeedback : false}
            >
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (pathname === '/admin' && item.href === '/admin/overview')}
                tooltip={item.label}
              >
                <Link href={item.href} className="pl-4 flex items-center gap-3">
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-4">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/admin/settings'}
              tooltip="Settings"
            >
              <Link href="/admin/settings" className="flex items-center gap-3">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarProfileHeader() {
  const { profile } = useAdminProfile();
  return (
    <div className="flex items-center gap-3 p-2">
      <Link href="/admin" className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar} data-ai-hint="profile picture" />
          <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sidebar-foreground truncate">{profile.displayName}</span>
        </div>
      </Link>
    </div>
  );
}
