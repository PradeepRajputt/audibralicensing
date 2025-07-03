
import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardLayoutClient } from './layout-client';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, the user ID would come from the session, 
  // but since we are handling auth state on the client now, we pass a placeholder
  // or handle cases where the user is not yet loaded.
  const hasUnread = await hasUnreadCreatorFeedback("user_creator_123");

  return (
    <SidebarProvider>
        <DashboardLayoutClient hasUnreadFeedback={hasUnread}>
            {children}
        </DashboardLayoutClient>
    </SidebarProvider>
  );
}
