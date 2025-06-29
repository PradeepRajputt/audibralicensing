import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </header>
        <main className="p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
