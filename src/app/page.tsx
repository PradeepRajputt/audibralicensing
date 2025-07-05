
import * as React from 'react';
import { Shield, User, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingPage } from '@/components/landing/landing-page';

export default function Home() {
    // With no authentication, this page becomes the main entry point
    // to navigate to the correct dashboard.
    return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
      <div className="flex items-center gap-4 mb-8">
        <Shield className="w-12 h-12 text-primary" />
        <h1 className="text-4xl font-bold text-primary">CreatorShield</h1>
      </div>
       <p className="max-w-xl text-center text-muted-foreground mb-12">
          This is a simplified navigation hub. In a real application, this would be the main landing page or a login screen.
        </p>
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/dashboard" className="group">
          <Card className="h-full text-left transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-accent/10 rounded-full">
                  <User className="w-12 h-12 text-accent" />
                </div>
              </div>
              <CardTitle className="text-center">Creator Dashboard</CardTitle>
              <CardDescription className="text-center pt-2">
                Access your analytics, monitor your content, and manage copyright claims.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">Go to Creator Dashboard</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin" className="group">
          <Card className="h-full text-left transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-accent/10 rounded-full">
                  <UserCog className="w-12 h-12 text-accent" />
                </div>
              </div>
              <CardTitle className="text-center">Admin Dashboard</CardTitle>
              <CardDescription className="text-center pt-2">
                Manage users, review copyright strikes, and oversee the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
                 <Button variant="secondary" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">Go to Admin Dashboard</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
