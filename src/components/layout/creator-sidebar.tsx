
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
import { ScanSearch, FileText, Settings, FileVideo, ShieldAlert, Home, LogOut, BarChart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDashboardData } from '@/app/dashboard/actions';

const menuItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
  { href: '/dashboard/content', label: 'My Content', icon: FileVideo },
  { href: '/dashboard/monitoring', label: 'Web Monitoring', icon: ScanSearch },
  { href: '/dashboard/violations', label: 'Violations', icon: ShieldAlert },
  { href: '/dashboard/reports', label: 'Submit Report', icon: FileText },
];

export function CreatorSidebar() {
  const pathname = usePathname();
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [creatorImage, setCreatorImage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCreatorInfo() {
      // In a real app with auth, this might come from a session context
      const data = await getDashboardData();
      setCreatorName(data?.creatorName ?? 'Creator');
      setCreatorImage(data?.creatorImage);
      setIsLoading(false);
    }
    loadCreatorInfo();
  }, []);

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
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
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
        <SidebarMenu className="gap-4">
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
            <SidebarMenuButton
              asChild
              tooltip="Logout"
            >
              <Link href="/">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  