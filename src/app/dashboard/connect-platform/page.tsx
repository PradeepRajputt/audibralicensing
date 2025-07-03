
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Youtube, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyYoutubeChannel } from '@/app/dashboard/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify & Connect'}</Button>;
}

export default function ConnectPlatformPage() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(verifyYoutubeChannel, null);

  React.useEffect(() => {
    if (!state) return;
    if (!state.success) {
      toast({ variant: 'destructive', title: "Verification Failed", description: state.message });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <Youtube className="mx-auto h-12 w-12 text-red-500" />
                <CardTitle className="text-2xl mt-4">Connect Your YouTube Channel</CardTitle>
                <CardDescription>
                    To get started, please provide your YouTube Channel ID. This is required to fetch your analytics and monitor your content.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="channelId">Channel ID</Label>
                        <Input id="channelId" name="channelId" placeholder="UCxxxxxxxxxxxxxxxxxxxxxx" required />
                        <p className="text-xs text-muted-foreground">Find this in your YouTube Studio settings under <code className="bg-muted px-1 py-0.5 rounded">youtube.com/account_advanced</code>.</p>
                    </div>
                    {state && !state.success && (
                        <p className="text-sm font-medium text-destructive">{state.message}</p>
                    )}
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
