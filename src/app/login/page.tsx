
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield, User, UserCog } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl mt-4">Login As</CardTitle>
          <CardDescription>
             Select a role to continue to the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button asChild className="w-full">
                <Link href="/dashboard">
                    <User className="mr-2" />
                    Login as Creator
                </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
                <Link href="/admin">
                    <UserCog className="mr-2" />
                    Login as Admin
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
