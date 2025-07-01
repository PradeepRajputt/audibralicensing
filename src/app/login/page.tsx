
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogIn, UserCog } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <CardTitle>Welcome to CreatorShield</CardTitle>
          <CardDescription>
            Sign in to access your dashboard. For this demo, no password is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => signIn('credentials', { userType: 'creator', callbackUrl: '/dashboard/overview' })}>
            <LogIn className="mr-2 h-4 w-4"/>
            Sign in as Creator
          </Button>
          <Button variant="outline" onClick={() => signIn('credentials', { userType: 'admin', callbackUrl: '/admin' })}>
            <UserCog className="mr-2 h-4 w-4"/>
            Sign in as Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
