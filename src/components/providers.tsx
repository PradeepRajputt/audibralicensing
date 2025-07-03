
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes/dist/types"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="zinc"
        enableSystem={false}
        disableTransitionOnChange
        {...props}
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
