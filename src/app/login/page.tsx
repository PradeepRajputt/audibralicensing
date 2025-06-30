
'use client';
// This page is effectively removed from the app flow by making it a no-op.
// All authentication is now handled client-side with mock data.
// A real app would have a proper login flow here.

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        // Since we have no login, redirect users to the dashboard.
        router.replace('/dashboard');
    }, [router]);

    return null; // Render nothing while redirecting
}
