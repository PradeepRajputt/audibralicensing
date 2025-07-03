
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

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

export function ClientHero() {
    return <HeroScene />;
}
