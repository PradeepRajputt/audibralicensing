
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
    const [isTryingToSignIn, setIsTryingToSignIn] = useState(false);
    const [isInIframe, setIsInIframe] = useState(false);

    useEffect(() => {
        // This check determines if the app is running inside an iframe (like the Studio preview)
        // and sets the state accordingly.
        if (typeof window !== 'undefined' && window.self !== window.top) {
            setIsInIframe(true);
        }
    }, []);

    useEffect(() => {
        // If the user is loaded and exists, redirect them to the correct dashboard.
        if (!loading && user && dbUser) {
             const redirectUrl = dbUser.role === 'admin' ? '/admin' : '/dashboard/overview';
             router.push(redirectUrl);
        }
    }, [user, dbUser, loading, router]);

    const handleSignIn = async () => {
        setIsTryingToSignIn(true);
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
        try {
            // The actual sign-in popup. This will trigger the onAuthStateChanged
            // listener in our AuthProvider, which will handle user creation and redirection.
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error during sign-in:", error);
            setIsTryingToSignIn(false);
        }
    };
    
    // Show a loader while checking auth state or during sign-in/redirect process.
    if (loading || (user && dbUser) || isTryingToSignIn) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="ml-4">Authenticating & Redirecting...</p>
            </div>
        );
    }
    
    // Unauthenticated state
    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
            <header className="p-4 md:p-6 border-b fixed top-0 w-full bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto flex items-center gap-4">
                    <Shield className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold text-primary">CreatorShield</h1>
                </div>
            </header>
             <main className="flex-1 flex items-center justify-center">
                <div className="container mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Protect Your Digital Content</h2>
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
                        CreatorShield is your all-in-one platform for content protection, analytics, and copyright management.
                    </p>
                    
                    {/* 
                      This conditional rendering handles the Firebase Studio preview environment.
                      Google OAuth popups are blocked inside iframes for security reasons.
                      Instead of showing a broken button, we guide the user to test authentication
                      in a real browser tab, which is the correct workflow.
                    */}
                    {isInIframe ? (
                         <Card className="w-full max-w-lg text-center">
                            <CardHeader>
                                <CardTitle>Sign-In Required</CardTitle>
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
                        // Standard Sign-In button for regular browser tabs
                        <Button onClick={handleSignIn} size="lg">
                            <LogIn className="mr-2 h-5 w-5" /> Sign in with Google
                        </Button>
                    )}
                </div>
            </main>
             <footer className="p-4 md:p-6 border-t w-full">
                <div className="container mx-auto text-center text-sm text-muted-foreground">© 2025 CreatorShield. All Rights Reserved.</div>
            </footer>
        </div>
    );
}
