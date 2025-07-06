'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, UserCog } from "lucide-react";
import GoogleLoginButton from "@/components/GoogleSignInButton";

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
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Protect Your Digital Content</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
            CreatorShield is your all-in-one platform for content protection, analytics, and copyright management.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Creator Card */}
            <Card className="h-full text-left transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-accent/10 rounded-full">
                    <User className="w-12 h-12 text-accent" />
                  </div>
                </div>
                <CardTitle className="text-center">Creator Dashboard</CardTitle>
                <CardDescription className="text-center pt-2">
                  For content creators. Access your analytics, monitor your content, and manage copyright claims.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleLoginButton role="creator" />
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="h-full text-left transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-accent/10 rounded-full">
                    <UserCog className="w-12 h-12 text-accent" />
                  </div>
                </div>
                <CardTitle className="text-center">Admin Dashboard</CardTitle>
                <CardDescription className="text-center pt-2">
                  For platform administrators. Manage users, review copyright strikes, and oversee the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleLoginButton role="admin" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="p-4 md:p-6 border-t mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CreatorShield. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
