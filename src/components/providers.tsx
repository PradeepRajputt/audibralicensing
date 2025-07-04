'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from "next-themes/dist/types"
import { UserProvider } from '@/context/user-context';

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="zinc"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <UserProvider>
        {children}
      </UserProvider>
    </ThemeProvider>
  );
}
