
'use client';

import * as React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, BarChart, Gavel, ScanSearch, User, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Header } from './header';

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

export function LandingPage() {
    const targetRef = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start start', 'end end']
    });
    
    // Animation for the main shield
    const heroScale = useTransform(scrollYProgress, [0, 0.05], [1, 0.7]);
    const heroOpacity = useTransform(scrollYProgress, [0.05, 0.1], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0.05, 0.15], ["0%", "-100%"]);

    return (
        <div ref={targetRef} className="relative bg-background text-foreground">
            <Header />

            <div className="h-[200vh]">
                <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
                   <motion.div
                      style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
                      className="flex flex-col items-center justify-center text-center space-y-4"
                   >
                     <Shield className="h-32 w-32 md:h-48 md:w-48 text-primary drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]" />
                     <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        CreatorShield
                     </h1>
                     <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                        Your Digital Guardian. We protect what you create, so you can focus on what you do best: creating.
                    </p>
                   </motion.div>
                </div>
            </div>

            <div className="relative z-10 -mt-[100vh] space-y-24 md:space-y-32 pb-32">

                {/* Features Section */}
                <div className="container mx-auto px-4">
                     <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.2 }}
                     >
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why We're Different</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                                    viewport={{ once: true, amount: 0.5 }}
                                >
                                    <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 text-center p-6">
                                        <div className="flex justify-center">{feature.icon}</div>
                                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
                
                 {/* Connecting Section */}
                <div className="container mx-auto px-4 text-center">
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="max-w-3xl mx-auto"
                     >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">For Creators, By Creators</h2>
                        <p className="text-lg text-muted-foreground">
                           We understand the heart and soul you pour into your work. That's why we built a tool that not only protects but empowers. Your creativity deserves a shield.
                        </p>
                    </motion.div>
                </div>


                {/* CTA Section */}
                <div className="container mx-auto px-4">
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.5 }}
                     >
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Come Inside</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                           <Card className="text-center transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                        <User className="w-12 h-12 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl pt-2">Creator</CardTitle>
                                    <CardDescription>Access your dashboard to monitor content and manage violations.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button size="lg" className="w-full" asChild>
                                        <Link href="/dashboard">Creator Login</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="text-center transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                        <UserCog className="w-12 h-12 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl pt-2">Admin</CardTitle>
                                    <CardDescription>Manage users, review copyright strikes, and oversee the platform.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <Button size="lg" className="w-full" variant="secondary" asChild>
                                        <Link href="/admin">Admin Login</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </div>
            
             <footer className="p-4 md:p-6 border-t">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} CreatorShield. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
