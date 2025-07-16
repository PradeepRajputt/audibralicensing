"use client";

import { Button } from "@/components/ui/button";
import { Shield, User, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChooseDashboardPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 md:p-6 border-b">
        <div className="container mx-auto flex items-center gap-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">CreatorShield</h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-xl w-full text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Welcome!</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Please choose your dashboard to continue.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Button
              className="h-32 flex flex-col items-center justify-center text-lg font-semibold gap-2 shadow-lg border border-accent/30 hover:scale-105 transition-transform"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              <User className="w-10 h-10 mb-2 text-accent" />
              Go to Creator Dashboard
            </Button>
            <Button
              className="h-32 flex flex-col items-center justify-center text-lg font-semibold gap-2 shadow-lg border border-accent/30 hover:scale-105 transition-transform"
              variant="outline"
              onClick={() => router.push("/admin")}
            >
              <UserCog className="w-10 h-10 mb-2 text-accent" />
              Go to Admin Dashboard
            </Button>
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