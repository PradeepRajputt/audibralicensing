
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { LogIn, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && dbUser) {
             const redirectUrl = dbUser.role === 'admin' ? '/admin' : '/dashboard';
             router.push(redirectUrl);
        }
    }, [user, dbUser, loading, router]);

    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
        try {
            await signInWithPopup(auth, provider);
            // The onAuthStateChanged listener in AuthProvider will handle the rest,
            // including the redirect.
        } catch (error) {
            console.error("Error during sign-in:", error);
        }
    };
    
    if (loading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="ml-4">Redirecting...</p>
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
            <Button onClick={handleSignIn}>
                <LogIn className="mr-2 h-5 w-5" /> Sign in with Google
            </Button>
        </div>
    );
}
