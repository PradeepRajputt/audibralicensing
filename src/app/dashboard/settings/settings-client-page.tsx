
'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from 'lucide-react';


export default function SettingsClientPage() {
    const [loading, setLoading] = React.useState(false); // Mock loading state
    
  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
                Manage your application settings.
            </p>
        </div>
         <Separator />
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>This is a placeholder for user profile information.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="flex items-center gap-6">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <div className="space-y-2">
                         <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full max-w-xs" />
                        </div>
                         <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full max-w-xs" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <ThemeSettings />

        <Card>
            <CardHeader>
                <CardTitle>Sign Out</CardTitle>
                <CardDescription>Sign out of your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
