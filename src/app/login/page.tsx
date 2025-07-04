'use client';

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Shield, Loader2, Mail, KeyRound, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { requestLoginOtpAction, verifyLoginAction } from './actions';

type Step = 'email' | 'otp' | 'pin';

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: "Your OTP must be 6 digits." }).max(6),
});

const pinSchema = z.object({
  pin: z.string().min(4, { message: "Your PIN must be 4 digits." }).max(4),
});

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [step, setStep] = React.useState<Step>('email');
    const [email, setEmail] = React.useState('');

    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });
    
    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const pinForm = useForm<z.infer<typeof pinSchema>>({
        resolver: zodResolver(pinSchema),
        defaultValues: { pin: "" },
    });

    const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
        setIsLoading(true);
        const result = await requestLoginOtpAction(values.email);
        if (result.success && result.otp) {
            toast({ 
                title: "OTP Generated (For Testing)", 
                description: `Your login code is: ${result.otp}` 
            });
            setEmail(values.email);
            setStep('otp');
        } else {
            toast({ 
                variant: 'destructive', 
                title: "Failed to get OTP", 
                description: result.message || "An unknown error occurred." 
            });
        }
        setIsLoading(false);
    }
    
    const handleVerificationSubmit = async (values: { otp?: string; pin?: string }) => {
        setIsLoading(true);
        const result = await verifyLoginAction({ email, ...values });
        
        if (result.success) {
            toast({ title: "Login Successful", description: "Welcome back!" });
            const destination = result.role === 'admin' ? '/admin' : '/dashboard';
            router.push(destination);
            router.refresh(); // This is important to re-fetch user data
        } else {
            toast({ variant: 'destructive', title: "Login Failed", description: result.message });
            setIsLoading(false);
        }
    }

    const goBack = () => setStep('email');

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="mx-auto max-w-sm w-full overflow-hidden">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: step === 'email' ? 0 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step !== 'email' && (
                             <Button variant="ghost" size="sm" onClick={goBack} className="absolute top-4 left-4 z-10">
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                        )}
                        {step === 'email' && (
                             <CardHeader className="text-center">
                                <Shield className="mx-auto h-12 w-12 text-primary" />
                                <CardTitle className="text-2xl mt-4">Welcome Back</CardTitle>
                                <CardDescription>Enter your email to receive a login code.</CardDescription>
                            </CardHeader>
                        )}
                         {step !== 'email' && (
                             <CardHeader className="text-center">
                                <Shield className="mx-auto h-12 w-12 text-primary" />
                                <CardTitle className="text-2xl mt-4">Check your Email</CardTitle>
                                <CardDescription>We've sent a code to <span className="font-semibold text-foreground">{email}</span></CardDescription>
                            </CardHeader>
                        )}
                        <CardContent>
                             {step === 'email' && (
                                <Form {...emailForm}>
                                    <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                                        <FormField control={emailForm.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl><Input type="email" placeholder="creator@example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                            Send Login Code
                                        </Button>
                                    </form>
                                </Form>
                            )}

                             {step === 'otp' && (
                                <Form {...otpForm}>
                                    <form onSubmit={otpForm.handleSubmit((values) => handleVerificationSubmit({ otp: values.otp }))} className="space-y-4">
                                        <FormField control={otpForm.control} name="otp" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>One-Time Password</FormLabel>
                                                <FormControl><Input type="text" placeholder="••••••" maxLength={6} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Verify Code
                                        </Button>
                                    </form>
                                </Form>
                            )}
                            
                             {step === 'pin' && (
                                <Form {...pinForm}>
                                    <form onSubmit={pinForm.handleSubmit((values) => handleVerificationSubmit({ pin: values.pin }))} className="space-y-4">
                                        <FormField control={pinForm.control} name="pin" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>4-Digit Backup PIN</FormLabel>
                                                <FormControl><Input type="password" placeholder="••••" maxLength={4} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Verify PIN
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            {step === 'otp' && <Button variant="link" size="sm" className="text-xs" onClick={() => setStep('pin')}>Use Backup PIN Instead</Button>}
                            {step === 'pin' && <Button variant="link" size="sm" className="text-xs" onClick={() => setStep('otp')}>Use One-Time Password</Button>}

                            <p className="text-xs text-center text-muted-foreground">
                                Don't have an account? No problem.
                                <br />
                                Your account will be created on first login.
                            </p>
                        </CardFooter>
                     </motion.div>
                </AnimatePresence>
            </Card>
        </div>
    );
}
