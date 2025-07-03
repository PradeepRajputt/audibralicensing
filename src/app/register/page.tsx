
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
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FaceAuth } from '@/components/face-auth';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');

  const handleRegistration = async (faceDescriptor: Float32Array) => {
    setIsLoading(true);
    
    try {
        const res = await fetch('/api/auth/register-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName, faceDescriptor: Array.from(faceDescriptor) }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'An error occurred.');
        }

        toast({
            title: "Registration Successful!",
            description: "Your facial data has been securely registered. You can now log in.",
        });
        router.push('/login');

    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl mt-4">Register with Face ID</CardTitle>
          <CardDescription>
            Enter your name and use your camera to register.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Your Name or Brand"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <FaceAuth 
                mode="register"
                onSuccess={handleRegistration}
                isDisabled={isLoading || !displayName.trim()}
            />
            
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
