
'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from 'next-auth/react';
import { Suspense, lazy } from 'react';

// Lazy load heavy providers to reduce initial bundle size
const YouTubeProvider = lazy(() => 
  import('@/context/youtube-context').then(mod => ({ default: mod.YouTubeProvider }))
);

const DashboardDataProvider = lazy(() => 
  import('@/app/dashboard/dashboard-context').then(mod => ({ default: mod.DashboardDataProvider }))
);

// Lazy load i18n only when needed (most users might not need it)
const I18nextProvider = lazy(() => 
  import('react-i18next').then(mod => ({ default: mod.I18nextProvider }))
);

// Lazy load i18n configuration
const getI18n = lazy(() => import('@/lib/i18n'));

// Loading fallback component
const ProviderLoadingFallback = () => (
  <div className="min-h-screen bg-background" />
);

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        {...props}
      >
        <Suspense fallback={<ProviderLoadingFallback />}>
          <DashboardDataProvider>
            <YouTubeProvider>
              <Suspense fallback={null}>
                <I18nextProvider i18n={getI18n}>
                  {children}
                  <Toaster />
                </I18nextProvider>
              </Suspense>
            </YouTubeProvider>
          </DashboardDataProvider>
        </Suspense>
      </ThemeProvider>
    </SessionProvider>
  );
}
