
'use client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ShieldCheck, BarChart, Gavel } from "lucide-react"
import Link from 'next/link'
import { Header } from "./header"

const features = [
    {
        icon: <ShieldCheck className="w-8 h-8 text-primary" />,
        title: "Automated Protection",
        description: "Our AI scans the web 24/7, finding and flagging potential infringements of your video, audio, and text content."
    },
    {
        icon: <BarChart className="w-8 h-8 text-primary" />,
        title: "Insightful Analytics",
        description: "Connect your YouTube channel to get real-time analytics on your content's performance."
    },
    {
        icon: <Gavel className="w-8 h-8 text-primary" />,
        title: "Simplified Takedowns",
        description: "We streamline the DMCA takedown process, generating pre-filled notices with just a few clicks."
    }
]


export function Overlay() {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-foreground">
            <Header />
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-1000">
                <div className="text-center p-4 pointer-events-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-200">
                        Protect Your Digital Content
                    </h1>
                    <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-purple-200/80">
                        CreatorShield is your all-in-one AI-powered platform for content protection, analytics, and copyright management. Focus on creating, we'll handle the rest.
                    </p>
                    <Button asChild size="lg" className="mt-12">
                        <Link href="/dashboard">Get Started Now</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
