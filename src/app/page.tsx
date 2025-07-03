
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, BarChart, Gavel } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/50">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Protect Your Digital Content, Effortlessly.
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-12">
              CreatorShield is your all-in-one AI-powered platform for content protection, analytics, and copyright management. Focus on creating, we'll handle the rest.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started Now</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="w-full py-20 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose CreatorShield?</h2>
              <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
                We're not just another tool. We're your partner in protecting the content you work so hard to create. We understand the frustration of seeing your work stolen, and we're here to give you peace of mind.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20">
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-fit">
                    <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Automated Protection</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Our AI scans the web 24/7, finding and flagging potential infringements of your video, audio, and text content across multiple platforms.
                </CardContent>
              </Card>
              <Card className="transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20">
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-fit">
                    <BarChart className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Insightful Analytics</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Connect your YouTube channel to get real-time analytics on your content's performance, helping you understand your audience and grow your brand.
                </CardContent>
              </Card>
              <Card className="transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20">
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-fit">
                    <Gavel className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Simplified Takedowns</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  We streamline the DMCA takedown process. Generate and submit pre-filled copyright strike notices with just a few clicks.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="p-4 md:p-6 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CreatorShield. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
