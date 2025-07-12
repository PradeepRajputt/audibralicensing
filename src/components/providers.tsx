
'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Toaster } from "@/components/ui/toaster"
import { YouTubeProvider } from '@/context/youtube-context';
import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { DashboardDataProvider } from '@/app/dashboard/dashboard-context';

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        {...props}
      >
        <DashboardDataProvider>
        <YouTubeProvider>
            <I18nextProvider i18n={i18n}>
          {children}
          <Toaster />
            </I18nextProvider>
        </YouTubeProvider>
        </DashboardDataProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
