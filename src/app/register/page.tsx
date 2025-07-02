
'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { registerAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function RegisterButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Creating Account...' : 'Create Account'}</Button>
}

export default function RegisterPage() {
    const [state, formAction] = useActionState(registerAction, { success: false, message: '' });

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="mx-auto max-w-sm">
                 <CardHeader className="text-center">
                    <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                    <CardDescription>Enter your information to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" name="displayName" placeholder="Your Channel Name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="Your phone number" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        {state && !state.success && (
                             <Alert variant="destructive">
                                <AlertTitle>Registration Failed</AlertTitle>
                                <AlertDescription>{state.message}</AlertDescription>
                            </Alert>
                        )}

                        <RegisterButton />
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
