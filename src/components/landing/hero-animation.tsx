
'use client';
import { ShieldCheck, BarChart, Gavel, ScanSearch, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroAnimation() {
  const iconClasses = "h-16 w-16 text-primary/70";
  const faceClasses = "absolute flex h-64 w-64 items-center justify-center border border-primary/10 bg-background/50 backdrop-blur-sm";

  return (
    <div className="absolute inset-0 flex items-center justify-center [perspective:1000px]">
      <div className="w-64 h-64 [transform-style:preserve-3d]" style={{ animation: 'spin-cube 25s linear infinite' }}>
        {/* Front */}
        <div className={cn(faceClasses)} style={{ transform: 'rotateY(0deg) translateZ(8rem)' }}>
          <ShieldCheck className={iconClasses} />
        </div>
        {/* Back */}
        <div className={cn(faceClasses)} style={{ transform: 'rotateY(180deg) translateZ(8rem)' }}>
          <Gavel className={iconClasses} />
        </div>
        {/* Right */}
        <div className={cn(faceClasses)} style={{ transform: 'rotateY(90deg) translateZ(8rem)' }}>
          <ScanSearch className={iconClasses} />
        </div>
        {/* Left */}
        <div className={cn(faceClasses)} style={{ transform: 'rotateY(-90deg) translateZ(8rem)' }}>
          <BarChart className={iconClasses} />
        </div>
        {/* Top */}
        <div className={cn(faceClasses)} style={{ transform: 'rotateX(90deg) translateZ(8rem)' }}>
          <Users className={iconClasses} />
        </div>
        {/* Bottom */}
        <div className={cn(faceClasses)} style={{ transform: 'rotateX(-90deg) translateZ(8rem)' }}>
          <FileText className={iconClasses} />
        </div>
      </div>
    </div>
  );
};
