
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, UserCog, LogIn } from "lucide-react";
import Link from 'next/link';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function InStudioRedirect() {
    return (
        <Card className="max-w-md text-center">
            <CardHeader>
                <CardTitle>Testing Authenticated Routes</CardTitle>
                <CardDescription>
                    To test Google Sign-In, please use either the local development server or the deployed Firebase Hosting URL. Direct login from the Studio preview window is restricted for security.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Open on Localhost</Button>
                </a>
                 <a href="https://shieldview-5ns5s.web.app" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="outline">Open Deployed Site</Button>
                </a>
            </CardContent>
        </Card>
    )
}

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is already logged in, redirect them
  if (user) {
    const targetDashboard = user.role === 'admin' ? '/admin' : '/dashboard';
    router.replace(targetDashboard);
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Redirecting to your dashboard...</p>
      </div>
    );
  }
  
  // This detects if we are in the Firebase Studio iframe
  if (typeof window !== 'undefined' && window.self !== window.top) {
      return (
           <div className="flex flex-col min-h-screen items-center justify-center p-4">
              <InStudioRedirect />
           </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 md:p-6 border-b">
        <div className="container mx-auto flex items-center gap-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">CreatorShield</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <Card className="max-w-md text-center">
            <CardHeader>
                <CardTitle className="text-3xl">Welcome to CreatorShield</CardTitle>
                <CardDescription>
                    Your all-in-one platform for content protection, analytics, and copyright management. Sign in to continue.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={signInWithGoogle} size="lg">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In with Google
                </Button>
            </CardContent>
        </Card>
      </main>

      <footer className="p-4 md:p-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CreatorShield. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
