
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
import { useUser } from '@/context/user-context';
import { hasUnrepliedAdminFeedback } from '@/lib/feedback-store';
import React from 'react';

const menuItems = [
  { href: '/admin/users', label: 'Creator Management', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
  { href: '/admin/strikes', label: 'Strike Requests', icon: Gavel },
  { href: '/admin/reactivations', label: 'Reactivation Requests', icon: UserCheck },
  { href: '/admin/feedback', label: 'Creator Feedback', icon: MessageSquareQuote },
];

export function AdminSidebar({ hasNewFeedback }: { hasNewFeedback: boolean }) {
  const pathname = usePathname();
  const { logout } = useUser();

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
                isActive={pathname.startsWith(item.href)}
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
              asChild
              tooltip="Logout"
              onClick={logout}
            >
              <button>
                <LogOut />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
