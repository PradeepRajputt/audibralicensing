'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Overlay } from '@/components/landing/overlay';
import { Loader2 } from 'lucide-react';

// Dynamically import HeroScene with SSR disabled, and add a loading placeholder
const HeroScene = dynamic(
  () => import('@/components/landing/hero-scene').then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    ),
  }
);


export default function HomePage() {
  return (
    <div className="relative h-svh w-full overflow-hidden bg-background">
      <HeroScene />
      <Overlay />
    </div>
  );
}
