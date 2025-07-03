
'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/context/user-context';
import Link from 'next/link';

export function AuthButtons() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-20 bg-white/10" />
                <Skeleton className="h-10 w-24 bg-white/10" />
            </div>
        )
    }

    return(
        <>
            {user ? (
                <Button asChild>
                    <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>Go to Dashboard</Link>
                </Button>
            ) : (
                <>
                <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Sign Up</Link>
                </Button>
                </>
            )}
        </>
    );
}

