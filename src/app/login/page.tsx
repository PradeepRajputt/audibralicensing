
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<null | 'credentials'>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const getCallbackUrl = () => {
    const error = searchParams.get('error');
    if (error === 'CredentialsSignin') {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
        });
    }
    const from = searchParams.get('callbackUrl');
    // Default to a specific dashboard if callbackUrl is not present
    return from || '/dashboard/overview'; 
  }
  
  const handleCredentialSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('credentials');
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: getCallbackUrl(),
    });
    // setIsLoading(false) might not be reached if redirect is successful
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to access your CreatorShield dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCredentialSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="creator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!!isLoading}>
               {isLoading === 'credentials' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
          
          <p className="px-8 text-center text-sm text-muted-foreground mt-4">
            By continuing, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a> and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Don't have an account?{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
