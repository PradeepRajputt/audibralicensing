
'use client';

import { SessionProvider } from 'next-auth/react';

// This component is kept for future providers (e.g., ThemeProvider, QueryClientProvider).
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
