
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { AuthButtons } from './auth-buttons';
import { Button } from '../ui/button';

export function Header() {
    return (
        <header className="p-4 md:p-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold text-primary">CreatorShield</h1>
                </Link>
                <nav className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="#features">Features</Link>
                    </Button>
                    <AuthButtons />
                </nav>
            </div>
        </header>
    )
}
