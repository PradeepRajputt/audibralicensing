
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
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


const themes = [
    { name: 'dark', label: 'Dark', colors: { primary: 'hsl(210 40% 98%)', accent: 'hsl(283 44% 67%)' } },
    { name: 'light', label: 'Light', colors: { primary: 'hsl(210 22% 29%)', accent: 'hsl(283 44% 47%)' } },
    { name: 'zinc', label: 'Zinc', colors: { primary: 'hsl(210 40% 98%)', accent: 'hsl(240 3.7% 15.9%)' } },
    { name: 'rose', label: 'Rose', colors: { primary: 'hsl(349 61% 72%)', accent: 'hsl(350 51% 32%)' } },
    { name: 'blue-black', label: 'Blue & Black', colors: { primary: 'hsl(217 91% 60%)', accent: 'hsl(217 33% 17%)' } },
    { name: 'light-trio', label: 'Light Trio', colors: { primary: 'hsl(217 91% 60%)', accent: 'hsl(43 74% 66%)' } },
    { name: 'orange-black', label: 'Orange & Black', colors: { primary: 'hsl(27 87% 67%)', accent: 'hsl(20 14% 15%)' } },
] as const;


export function ThemeSettings() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
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
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
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
  );
}
