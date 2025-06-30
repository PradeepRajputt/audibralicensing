
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function AnalogClock({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourRotation = (hours % 12 + minutes / 60) * 30;
  const minuteRotation = minutes * 6;
  const secondRotation = seconds * 6;

  return (
    <div className={cn("relative w-32 h-32", className)} {...props}>
      <div className="absolute inset-0 bg-secondary rounded-full border-2 border-primary/20 shadow-inner" />
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-full"
          style={{ transform: `rotate(${i * 30}deg)` }}
        >
          <div
            className={cn(
              "absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-foreground/50",
              (i + 1) % 3 === 1 && "h-4 bg-foreground"
            )}
          />
        </div>
      ))}
      <div
        className="absolute top-1/2 left-1/2 w-1.5 h-16 bg-primary rounded-t-full origin-bottom"
        style={{ transform: `rotate(${hourRotation}deg) translateY(-50%)` }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-1 h-[5.5rem] bg-foreground rounded-t-full origin-bottom"
        style={{ transform: `rotate(${minuteRotation}deg) translateY(-50%)` }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-red-500 origin-bottom"
        style={{ transform: `rotate(${secondRotation}deg) translateY(-50%)` }}
      />
      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-background" />
    </div>
  );
}

