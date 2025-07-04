
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Check, KeyRound, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser } from '@/context/user-context';
import { setBackupPinAction } from '@/app/dashboard/settings/actions';
import { useToast } from '@/hooks/use-toast';

const themes = [
    { name: 'zinc', label: 'Zinc', colors: { primary: 'hsl(210 40% 98%)', accent: 'hsl(217.2 32.6% 17.5%)' } },
    { name: 'rose', label: 'Rose', colors: { primary: 'hsl(349 61% 72%)', accent: 'hsl(350 51% 32%)' } },
    { name: 'blue', label: 'Blue', colors: { primary: 'hsl(217 91% 60%)', accent: 'hsl(217 33% 22%)' } },
] as const;

const pinFormSchema = z.object({
  pin: z.string().length(4, "PIN must be 4 digits.").regex(/^\d{4}$/, "PIN must be numeric."),
});


export function ThemeSettings() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const [isSavingPin, setIsSavingPin] = React.useState(false);

  const form = useForm<z.infer<typeof pinFormSchema>>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: { pin: "" },
  });

  const onPinSubmit = async (values: z.infer<typeof pinFormSchema>) => {
    if (!user) return;
    setIsSavingPin(true);
    const result = await setBackupPinAction(user.id, values.pin);
    if(result.success) {
      toast({ title: "PIN Set", description: "Your backup PIN has been saved securely." });
      form.reset();
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.message });
    }
    setIsSavingPin(false);
  }

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Select a theme for the application. This will be applied across the entire app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!mounted ? (
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            {themes.map((t) => (
              <Label
                key={t.name}
                htmlFor={`theme-${t.name}`}
                className={cn(
                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                  theme === t.name && "border-primary"
                )}
              >
                <RadioGroupItem value={t.name} id={`theme-${t.name}`} className="sr-only" />
                <div className="mb-2 flex items-center gap-2 rounded-md border p-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                </div>
                {t.label}
                {theme === t.name && (
                    <Check className="h-4 w-4 absolute top-2 right-2 text-primary" />
                )}
              </Label>
            ))}
          </RadioGroup>
          )}
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Set a 4-digit backup PIN for login if email is unavailable.</CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onPinSubmit)} className="space-y-4 max-w-sm">
                   <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>New 4-Digit PIN</FormLabel>
                              <FormControl>
                                  <Input type="password" placeholder="••••" maxLength={4} {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isSavingPin}>
                      {isSavingPin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                      Set Backup PIN
                    </Button>
                </form>
              </Form>
          </CardContent>
      </Card>
    </>
  );
}

