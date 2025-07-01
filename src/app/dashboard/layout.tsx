
import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { getUserById } from '@/lib/users-store';
import { DashboardLayoutClient } from './layout-client';

// This is now an async Server Component
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, this would be from the session
  const user = await getUserById("user_creator_123");

  return (
    <SidebarProvider>
      <DashboardLayoutClient user={user}>
          {children}
      </DashboardLayoutClient>
    </SidebarProvider>
  );
}
