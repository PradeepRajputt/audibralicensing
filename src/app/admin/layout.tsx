
import * as React from 'react';
import { AdminLayoutClient } from './layout-client';
import { hasUnrepliedAdminFeedback } from '@/lib/feedback-store';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const hasNewFeedback = await hasUnrepliedAdminFeedback();

    return (
      <AdminLayoutClient hasNewFeedback={hasNewFeedback}>
        {children}
      </AdminLayoutClient>
    );
}
