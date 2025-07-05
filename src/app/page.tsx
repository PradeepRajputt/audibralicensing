
import * as React from 'react';
import { Shield, BarChart, Gavel, ScanSearch, User, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
    {
        icon: <ScanSearch className="h-10 w-10 mb-4 text-primary" />,
        title: "Automated Scanning",
        description: "Our AI vigilantly scans platforms like YouTube, Instagram, and across the web, finding unauthorized uses of your content 24/7."
    },
    {
        icon: <BarChart className="h-10 w-10 mb-4 text-primary" />,
        title: "Insightful Analytics",
        description: "Track your content's performance and see the impact of your protection efforts with our easy-to-understand analytics dashboard."
    },
    {
        icon: <Gavel className="h-10 w-10 mb-4 text-primary" />,
        title: "Simplified Takedowns",
        description: "We turn the complex DMCA process into a few simple clicks, generating takedown notices to help you reclaim your hard work."
    }
]

export default function LandingPage() {
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
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">CreatorShield is your all-in-one platform for content protection, analytics, and copyright management.</p>
                     <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <Link href="/dashboard" className="group">
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
                                    <Button className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">Go to Creator Dashboard</Button>
                                </CardContent>
                            </Card>
                        </Link>
                         <Link href="/admin" className="group">
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
                                    <Button variant="secondary" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">Go to Admin Dashboard</Button>
                                </CardContent>
                            </Card>
                        </Link>
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

