
'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes/dist/types"
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <AuthProvider>
      <ThemeProvider
      attribute="data-theme"
      defaultTheme="zinc"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
      >
          {children}
          <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}
