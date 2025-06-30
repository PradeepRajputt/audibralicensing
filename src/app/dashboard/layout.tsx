import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';

function DashboardHeader() {
  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
     </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <CreatorSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
