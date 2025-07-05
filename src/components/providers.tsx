
'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Toaster } from "@/components/ui/toaster"
import { YouTubeProvider } from '@/context/youtube-context';

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
      <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      {...props}
      >
        <YouTubeProvider>
            {children}
            <Toaster />
        </YouTubeProvider>
      </ThemeProvider>
  );
}
