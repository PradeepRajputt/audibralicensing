
'use client';
import * as React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Shield, User, UserCog, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    if (status === "authenticated") {
        const dashboardUrl = session.user.role === 'admin' ? '/admin' : '/dashboard';
        return (
            <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
                <div className="flex items-center gap-4 mb-8">
                    <Shield className="w-12 h-12 text-primary" />
                    <h1 className="text-4xl font-bold text-primary">CreatorShield</h1>
                </div>
                <p className="max-w-xl text-center text-muted-foreground mb-12">
                   Welcome back, {session.user.name}! You are signed in.
                </p>
                <Button onClick={() => router.push(dashboardUrl)}>Go to Your Dashboard</Button>
            </div>
        );
    }
    
    // Unauthenticated state
    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
            <div className="flex items-center gap-4 mb-8">
                <Shield className="w-12 h-12 text-primary" />
                <h1 className="text-4xl font-bold text-primary">CreatorShield</h1>
            </div>
            <p className="max-w-xl text-center text-muted-foreground mb-12">
                Your all-in-one platform for content protection, analytics, and copyright management. Sign in to continue.
            </p>
            <Button onClick={() => signIn('google')}>
                <LogIn className="mr-2 h-5 w-5" /> Sign in with Google
            </Button>
        </div>
    );
}
