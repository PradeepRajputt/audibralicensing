
'use client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, BarChart, Gavel, UserCog, User } from "lucide-react"
import Link from 'next/link'
import { Header } from "./header"

const features = [
    {
        icon: <ShieldCheck className="w-8 h-8 text-primary" />,
        title: "Automated Protection",
        description: "Our AI is your tireless guardian, scanning the web 24/7 to find and flag copies of your hard work."
    },
    {
        icon: <BarChart className="w-8 h-8 text-primary" />,
        title: "Insightful Analytics",
        description: "Go beyond simple view counts. Understand your content's real impact and audience with our deep analytics."
    },
    {
        icon: <Gavel className="w-8 h-8 text-primary" />,
        title: "Simplified Takedowns",
        description: "Take back control. We turn the complex DMCA process into a few simple clicks, empowering you to protect your rights."
    }
]

export function Overlay() {
    return (
        <div className="relative z-10 flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-16 items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
                    <div className="space-y-6 text-center md:text-left animate-in fade-in duration-1000">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                           Your Digital Guardian
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                           In a world of endless content, your originality is your greatest asset. CreatorShield is your dedicated partner, working tirelessly to protect what you create so you can focus on what you do best: creating.
                        </p>
                         <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                            {features.slice(0,2).map((feature) => (
                                <div key={feature.title} className="p-4 rounded-lg bg-background/30 backdrop-blur-sm border border-primary/10">
                                    <div className="flex items-center gap-4">
                                        {feature.icon}
                                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-1000 delay-500">
                         <Card className="w-full max-w-sm bg-background/50 backdrop-blur-lg border-primary/20 text-center">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    <User className="w-12 h-12 text-primary" />
                                </div>
                                <CardTitle className="text-2xl pt-2">For Creators</CardTitle>
                                <CardDescription>Access your dashboard to monitor content, view analytics, and manage violations.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button size="lg" className="w-full" asChild>
                                    <Link href="/dashboard">Creator Login</Link>
                                </Button>
                            </CardContent>
                        </Card>
                         <Card className="w-full max-w-sm bg-background/50 backdrop-blur-lg border-primary/20 text-center">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    <UserCog className="w-12 h-12 text-primary" />
                                </div>
                                <CardTitle className="text-2xl pt-2">For Admins</CardTitle>
                                <CardDescription>Manage users, review copyright strikes, and oversee the platform.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <Button size="lg" className="w-full" variant="secondary" asChild>
                                    <Link href="/admin">Admin Login</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
