
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { HeroScene } from '@/components/landing/hero-scene';
import { Overlay } from '@/components/landing/overlay';

const NoSSR = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const DynamicNoSSR = dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
});


export default function HomePage() {
  return (
    <div className="relative h-svh w-full overflow-hidden bg-background">
      <DynamicNoSSR>
        <HeroScene />
      </DynamicNoSSR>
      <Overlay />
    </div>
  );
}
