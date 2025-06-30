
'use client';

import { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorMessages: { [key: string]: string } = {
    CredentialsSignin: "Invalid email or password. Please try again.",
    Default: "An unknown error occurred. Please try again.",
  };

  useEffect(() => {
    // Show a success toast if redirected from registration
    if (searchParams.get('registered') === 'true') {
      toast({
        title: "Registration Successful",
        description: "You can now sign in with your new account.",
      });
      // Remove the query param from the URL
      router.replace('/login', {scroll: false});
    }

    const error = searchParams.get('error');
    if (error) {
      const errorMessage = errorMessages[error] || decodeURIComponent(error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
       router.replace('/login', {scroll: false});
    }
  }, [searchParams, toast, router]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    // This will redirect on success, or add an `error` query param on failure
    await signIn('credentials', {
      email,
      password,
      callbackUrl,
    });
    
    // This part is often not reached because of the redirect,
    // but it's a good fallback in case of an unhandled promise rejection.
    setIsLoading(false);
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your CreatorShield account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="creator@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
           <p className="text-center text-sm text-muted-foreground mt-4">
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
