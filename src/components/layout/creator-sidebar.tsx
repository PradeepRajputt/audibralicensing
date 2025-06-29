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
import { Shield, LayoutDashboard, Youtube, ScanSearch, FileText, Settings, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'YouTube Analytics', icon: Youtube },
  { href: '/dashboard/monitoring', label: 'Content Monitoring', icon: ScanSearch },
  { href: '/dashboard/strikes', label: 'Copyright Strikes', icon: FileText },
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
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/dashboard/settings" legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === '/dashboard/settings'}
                  tooltip="Settings"
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <Link href="/" legacyBehavior passHref>
              <SidebarMenuButton>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
