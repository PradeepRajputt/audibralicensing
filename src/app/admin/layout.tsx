
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ADMIN_EMAILS = [
  'guddumisra003@gmail.com',
  'contactpradeeprajput@gmail.com',
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const router = useRouter();
    const [showPopup, setShowPopup] = React.useState(false);

    React.useEffect(() => {
      if (session?.user?.email && !ADMIN_EMAILS.includes(session.user.email)) {
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          router.replace('/dashboard/overview');
        }, 3000);
      }
    }, [session, router]);

    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <DashboardHeader title="Admin Dashboard" />
          <main className="p-4 md:p-6">
              {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p className="mb-4">You do not have access to become an admin.<br/>We are redirecting you to the creator dashboard in 3 seconds.</p>
                  </div>
                </div>
              )}
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
}
