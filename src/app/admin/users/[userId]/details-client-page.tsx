'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldBan, Trash2, Youtube, Instagram, Globe, ShieldCheck, Loader2 } from "lucide-react";
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { suspendCreator, liftSuspension, deactivateCreator } from './actions';
import type { User } from '@/lib/types';
import { ClientFormattedDate } from '@/components/ui/client-formatted-date';


const platformIcons = {
    youtube: <Youtube className="h-6 w-6 text-red-500" />,
    instagram: <Instagram className="h-6 w-6 text-pink-500" />,
    web: <Globe className="h-6 w-6" />,
    tiktok: <div className="h-6 w-6" /> // Placeholder for TikTok
} as const;


export default function DetailsClientPage({ initialUser }: { initialUser: User | undefined }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [isLoading, setIsLoading] = useState<'suspend' | 'lift' | 'deactivate' | null>(null);

  // This effect keeps the local state in sync if the server component re-renders with new props
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);
  
  const handleAction = async (action: 'suspend' | 'lift' | 'deactivate') => {
      if (!user) return;
      setIsLoading(action);

      let result;
      let newStatus: User['status'] = user.status;

      switch(action) {
          case 'suspend':
              result = await suspendCreator(user.id);
              newStatus = 'suspended';
              break;
          case 'lift':
              result = await liftSuspension(user.id);
              newStatus = 'active';
              break;
          case 'deactivate':
              result = await deactivateCreator(user.id);
              newStatus = 'deactivated';
              break;
      }
      
      if (result && result.success) {
          toast({ title: "Action Successful", description: result.message });
          // Optimistically update the UI
          setUser(prev => prev ? { ...prev, status: newStatus } : undefined);
      } else {
          toast({ variant: 'destructive', title: "Action Failed", description: result?.message || 'An unknown error occurred.' });
      }

      setIsLoading(null);
  };


  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested creator could not be found.</p>
          <Button asChild variant="link" className="px-0">
            <Link href="/admin/users">Return to Creator Management</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} data-ai-hint="profile picture" />
            <AvatarFallback>{user.displayName?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Back to Creator List</Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Creator Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creator ID</span>
              <span className="font-mono text-sm">{user.id}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Join Date</span>
              <span><ClientFormattedDate dateString={user.joinDate} /></span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {user.platformsConnected.length > 0 ? user.platformsConnected.map(platform => (
              <div key={platform} className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                {platformIcons[platform as keyof typeof platformIcons]}
                <span className="capitalize">{platform}</span>
              </div>
            )) : <p className="text-muted-foreground">No platforms connected.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Perform administrative actions on this creator account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-yellow-200/50 rounded-lg bg-yellow-50/10 dark:bg-yellow-500/10">
            <div>
              <h3 className="font-semibold">Suspend Creator</h3>
              <p className="text-sm text-muted-foreground">Temporarily disable account for 24 hours.</p>
            </div>
            {user.status === 'suspended' ? (
                <Button variant="outline" onClick={() => handleAction('lift')} disabled={isLoading === 'lift'}>
                    {isLoading === 'lift' ? <Loader2 className="mr-2 animate-spin" /> : <ShieldCheck className="mr-2" />}
                    Lift Suspension
                </Button>
            ) : (
                <Button variant="outline" onClick={() => handleAction('suspend')} disabled={isLoading === 'suspend' || user.status === 'deactivated'}>
                    {isLoading === 'suspend' ? <Loader2 className="mr-2 animate-spin" /> : <ShieldBan className="mr-2" />}
                    Suspend
                </Button>
            )}
          </div>
          <div className="flex items-center justify-between p-4 border-destructive/50 rounded-lg bg-destructive/10">
            <div>
              <h3 className="font-semibold text-destructive">Deactivate Creator</h3>
              <p className="text-sm text-muted-foreground">This will log the creator out. They must request reactivation to log in again.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading === 'deactivate' || user.status === 'deactivated'}>
                    {user.status === 'deactivated' ? 'Deactivated' : (
                        <>
                            {isLoading === 'deactivate' ? <Loader2 className="mr-2 animate-spin" /> : <Trash2 className="mr-2" />}
                            Deactivate
                        </>
                    )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to deactivate {user?.displayName}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will require the creator to submit a reactivation request for your approval to regain access.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction('deactivate')}>
                    Yes, Deactivate Creator
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
