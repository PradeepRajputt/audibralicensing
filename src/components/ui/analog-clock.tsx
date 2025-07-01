
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AnalogClockProps extends React.HTMLAttributes<HTMLDivElement> {
  timeZone?: string;
}

export function AnalogClock({ className, timeZone = 'UTC', ...props }: AnalogClockProps) {
  const [time, setTime] = React.useState(new Date(new Date().toLocaleString('en-US', { timeZone })));

  React.useEffect(() => {
    const timerId = setInterval(() => {
      // This is a common way to get a Date object that reflects the time in another timezone.
      // It creates a string representation in the target timezone, then parses it back into a Date.
      // The local environment's timezone is ignored, and methods like getHours() will return
      // the hour in the target timezone.
      setTime(new Date(new Date().toLocaleString('en-US', { timeZone })));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeZone]);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourRotation = (hours % 12 + minutes / 60) * 30;
  const minuteRotation = minutes * 6;
  const secondRotation = seconds * 6;

  return (
    <div className={cn("relative w-32 h-32 bg-secondary rounded-full border-4 border-primary/20 shadow-inner mx-auto", className)} {...props}>
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-full"
          style={{ transform: `rotate(${i * 30}deg)` }}
        >
          <div
            className={`absolute top-1 left-1/2 -translate-x-1/2 w-0.5 ${
              i % 3 === 0 ? "h-3 bg-foreground" : "h-2 bg-foreground/50"
            }`}
          />
        </div>
      ))}

      {/* Hour Hand */}
      <div
        className="absolute top-1/2 left-1/2 w-1 h-8 bg-primary rounded-full origin-bottom"
        style={{ transform: `translate(-50%, -100%) rotate(${hourRotation}deg)` }}
      />

      {/* Minute Hand */}
      <div
        className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-foreground rounded-full origin-bottom"
        style={{ transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)` }}
      />

      {/* Second Hand */}
      <div
        className="absolute top-1/2 left-1/2 w-0.5 h-14 bg-red-500 origin-bottom"
        style={{ transform: `translate(-50%, -100%) rotate(${secondRotation}deg)` }}
      />

      {/* Center Dot */}
      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-background" />
    </div>
  );
}
