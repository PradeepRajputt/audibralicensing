
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if(!isUserLoading && user) {
        const destination = user.role === 'admin' ? '/admin' : '/dashboard';
        router.push(destination);
    }
  }, [user, isUserLoading, router]);


  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting you to your dashboard...',
      });

      // Refresh the page to allow the UserProvider to pick up the new cookie
      window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
      
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: message,
        });
    } finally {
      setIsLoading(false);
    }
  };
  
  // This screen will show a loader until we know if a user is already logged in
  if (isUserLoading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl mt-4">Login</CardTitle>
          <CardDescription>
             Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                </Button>
            </form>
           <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

