'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    setIsScrolled(latest > 50);
  })

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-20 transition-all duration-300",
      isScrolled ? "bg-background/80 backdrop-blur-sm border-b" : "bg-transparent border-b border-transparent"
      )}>
        <div className="container mx-auto flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">CreatorShield</h1>
            </Link>
        </div>
    </header>
  )
}
