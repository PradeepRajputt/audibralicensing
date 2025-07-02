
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="mx-auto max-w-sm text-center">
                <CardHeader>
                    <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
                    <CardTitle className="text-2xl font-bold">Sign In Disabled</CardTitle>
                    <CardDescription>The authentication system has been removed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/" className="underline">
                        Return to Home
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
