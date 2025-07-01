
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <CardTitle>Authentication Removed</CardTitle>
          <CardDescription>
            The sign-in and registration functionality has been temporarily removed. You can proceed directly to the dashboards.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/dashboard/overview">Go to Creator Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">Go to Admin Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
