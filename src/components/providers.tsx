
'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Toaster } from "@/components/ui/toaster"
import { YouTubeProvider } from '@/context/youtube-context';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        {...props}
      >
        <YouTubeProvider>
          {children}
          <Toaster />
        </YouTubeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
