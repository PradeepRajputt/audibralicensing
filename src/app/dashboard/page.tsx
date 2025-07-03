
'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import DashboardClientPage from './dashboard-client-page';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return null; // Or a loading spinner, handled by the provider currently
  }

  if (!user) {
    // This case is handled by middleware, but as a fallback:
    return (
       <div className="flex-1 flex items-center justify-center">
        <Card className="text-center w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You must be signed in to view the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.push('/login?callbackUrl=/dashboard')}>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                </Button>
            </CardContent>
        </Card>
      </div>
    )
  }

  return <DashboardClientPage />;
}
