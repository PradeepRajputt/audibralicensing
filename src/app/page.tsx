
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { LogIn, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [isInIframe, setIsInIframe] = useState(false);

    useEffect(() => {
        // This check determines if the app is running inside an iframe (like the Studio preview)
        if (typeof window !== 'undefined' && window.self !== window.top) {
            setIsInIframe(true);
        }
    }, []);

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
            // The onAuthStateChanged listener in AuthProvider will handle the rest
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
            
            {isInIframe ? (
                 <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle>Testing Google Sign-In</CardTitle>
                        <CardDescription>
                            For security reasons, Google Sign-In cannot be used inside this preview window.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm">To test your authentication flow, please use one of these options:</p>
                        <div className="flex justify-center gap-4">
                             <Button asChild>
                                <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
                                    Open on Localhost
                                </a>
                            </Button>
                            <Button asChild variant="secondary">
                                <a href="https://shieldview-5ns5s.web.app" target="_blank" rel="noopener noreferrer">
                                    Open Deployed Site
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <p className="max-w-xl text-center text-muted-foreground mb-12">
                        Your all-in-one platform for content protection, analytics, and copyright management. Sign in to continue.
                    </p>
                    <Button onClick={handleSignIn}>
                        <LogIn className="mr-2 h-5 w-5" /> Sign in with Google
                    </Button>
                </>
            )}
        </div>
    );
}
