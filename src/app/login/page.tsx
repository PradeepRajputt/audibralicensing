
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FaceAuth } from '@/components/face-auth';
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


  const handleLogin = async (faceDescriptor: Float32Array) => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: Array.from(faceDescriptor) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting you to your dashboard...',
      });

      // Let the cookie take effect, then refresh to trigger middleware and context update
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
          <CardTitle className="text-2xl mt-4">Login with Face ID</CardTitle>
          <CardDescription>
             Use your registered face to securely log in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <FaceAuth 
                mode="login"
                onSuccess={handleLogin}
                isDisabled={isLoading}
            />
           <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Register with Face ID
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
