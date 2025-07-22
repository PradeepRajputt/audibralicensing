
import type {Metadata} from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

// Optimize font loading with preload and better display strategy
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-code-pro',
  preload: false, // Only preload if heavily used
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  title: 'CreatorShield',
  description: 'A SaaS platform to protect your content.',
  icons: {
    icon: '/favicon.ico',
  },
  // Add performance optimizations
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
  // Add preconnect for external resources
  other: {
    'preconnect': 'https://checkout.razorpay.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        
        {/* Load Razorpay script asynchronously only when needed */}
        <script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          async
          defer
        />
      </head>
      <body 
        className={cn(
          "font-body antialiased min-h-screen bg-background", 
          inter.variable, 
          sourceCodePro.variable
        )} 
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
