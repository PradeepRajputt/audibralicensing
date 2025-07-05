
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  return (
      <SidebarProvider>
          <CreatorSidebar />
          <SidebarInset>
              <DashboardHeader />
              <main className="p-4 md:p-6 flex-1 flex flex-col">
              {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
              ) : children}
              </main>
          </SidebarInset>
      </SidebarProvider>
  );
}
