
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
import { Shield, Users, Gavel, Settings, LogOut, UserCheck, BarChart, MessageSquareQuote } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from "firebase/auth";
import { auth } from '@/lib/firebase';
import React from 'react';
import { useAuth } from '@/context/auth-context';
import { hasUnrepliedAdminFeedback } from '@/lib/feedback-store';

const menuItems = [
  { href: '/admin/overview', label: 'Overview', icon: BarChart },
  { href: '/admin/users', label: 'Creator Management', icon: Users },
  { href: '/admin/strikes', label: 'Strike Requests', icon: Gavel },
  { href: '/admin/reactivations', label: 'Reactivation Requests', icon: UserCheck },
  { href: '/admin/feedback', label: 'Creator Feedback', icon: MessageSquareQuote },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [hasNewFeedback, setHasNewFeedback] = React.useState(false);

  React.useEffect(() => {
    hasUnrepliedAdminFeedback().then(setHasNewFeedback);
  }, [pathname]); // Re-check on navigation

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-sidebar-primary" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">CreatorShield</h1>
        </Link>
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
                <Link href={item.href}>
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
              <Link href="/admin/settings">
                <Settings />
                <span>Settings</span>
              </Link>
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
