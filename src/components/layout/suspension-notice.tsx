'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';


export function SuspensionNotice() {
  const { setStatus } = useUser();

  const handleSimulateReactivation = () => {
      // In a real app, this button would not exist. This is for demo purposes 
      // to allow easy testing of the suspended state.
      setStatus('active');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
            <Ban className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl">Account Suspended</CardTitle>
          <CardDescription>
             Your account is temporarily suspended for 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Please contact support if you believe this is a mistake.
          </p>
           <Button onClick={handleSimulateReactivation} variant="outline">
            (For Demo) Restore Account Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
