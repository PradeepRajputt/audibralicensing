
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 md:p-6 border-b">
        <div className="container mx-auto flex items-center gap-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">CreatorShield</h1>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Protect Your Digital Content
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
            CreatorShield is your all-in-one platform for content protection, analytics, and copyright management.
          </p>
          
          <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                  <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                  <Link href="/register">Create an Account</Link>
              </Button>
          </div>
        </div>
      </main>
      <footer className="p-4 md:p-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CreatorShield. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
