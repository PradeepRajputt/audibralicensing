
'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';

export function Header() {
    return (
        <header className="p-4 md:p-6">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold text-primary">CreatorShield</h1>
                </Link>
            </div>
        </header>
    )
}
