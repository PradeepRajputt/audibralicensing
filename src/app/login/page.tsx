
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Camera } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FaceAuth } from '@/components/face-auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isAuthStarted, setIsAuthStarted] = React.useState(false);

  const handleLogin = async (faceDescriptor: Float32Array) => {
    setIsLoading(true);
    setError(null);

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
      
      const { user } = data;
      const destination = user.role === 'admin' ? '/admin' : '/dashboard';
      
      router.push(destination);
      
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
        setError(message);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: message,
        })
        // Allow user to try again
        setIsAuthStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl mt-4">Login with Face ID</CardTitle>
          <CardDescription>
            {isAuthStarted ? "Position your face in the camera to log in." : "Click below to start facial recognition."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {isAuthStarted ? (
                <FaceAuth 
                    mode="login"
                    onSuccess={handleLogin}
                    isDisabled={isLoading}
                />
             ) : (
                <div className="flex flex-col items-center gap-4">
                    <Button onClick={() => setIsAuthStarted(true)} className="w-full">
                        <Camera className="mr-2 h-4 w-4" />
                        Start Face Scan
                    </Button>
                </div>
             )}

            {error && (
                <div className="text-sm font-medium text-destructive text-center pt-2">
                    {error}
                </div>
            )}
          </div>
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
