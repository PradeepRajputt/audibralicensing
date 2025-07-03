
'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { AuthButtons } from './auth-buttons';

export function Header() {
    return (
        <header className="p-4 md:p-6 absolute top-0 left-0 right-0 z-10 pointer-events-auto">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold text-primary">CreatorShield</h1>
                </Link>
                <nav className="flex items-center gap-2">
                    <AuthButtons />
                </nav>
            </div>
        </header>
    )
}
