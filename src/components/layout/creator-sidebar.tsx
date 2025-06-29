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
import { Home, Shield, LayoutDashboard, Youtube, ScanSearch, FileText, Settings, LogOut, FileVideo, ShieldAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'Analytics', icon: Youtube },
  { href: '/dashboard/monitoring', label: 'Web Monitoring', icon: ScanSearch },
  { href: '/dashboard/content', label: 'My Content', icon: FileVideo },
  { href: '/dashboard/violations', label: 'Violations', icon: ShieldAlert },
  { href: '/dashboard/reports', label: 'Submit Report', icon: FileText },
];

export function CreatorSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-sidebar-primary" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">CreatorShield</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                // This strict equality check is the correct way to determine the active link.
                // It ensures only the link that exactly matches the current URL is highlighted.
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href} prefetch={false}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard/settings'}
              tooltip="Settings"
            >
              <Link href="/dashboard/settings" prefetch={false}>
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" prefetch={false}>
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
