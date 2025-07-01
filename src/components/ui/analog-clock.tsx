
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AnalogClockProps extends React.HTMLAttributes<HTMLDivElement> {
  timeZone?: string;
}

export function AnalogClock({ className, timeZone = 'UTC', ...props }: AnalogClockProps) {
  const [time, setTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const updateClock = () => {
      try {
        const strTime = new Date().toLocaleString('en-US', { timeZone });
        setTime(new Date(strTime));
      } catch (e) {
        console.error("Invalid time zone:", timeZone);
        setTime(new Date()); 
      }
    };

    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, [timeZone]);

  const hours = time ? time.getHours() : 0;
  const minutes = time ? time.getMinutes() : 0;
  const seconds = time ? time.getSeconds() : 0;

  const hourRotation = (hours % 12 + minutes / 60) * 30;
  const minuteRotation = minutes * 6;
  const secondRotation = seconds * 6;

  return (
    <div className={cn("relative w-36 h-36 bg-secondary rounded-full border-4 border-primary/20 shadow-inner", className)} {...props}>
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-full"
          style={{ transform: `rotate(${i * 30}deg)` }}
        >
          <div
            className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-0.5 ${
              i % 3 === 0 ? "h-3.5 bg-foreground" : "h-2 bg-foreground/50"
            }`}
          />
        </div>
      ))}
      
      {time && (
        <>
           {/* Hour Hand */}
          <div
            className="absolute top-1/2 left-1/2 w-1 h-10 bg-primary rounded-full origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(${hourRotation}deg)`, transition: 'transform 0.5s ease-out' }}
          />

          {/* Minute Hand */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-foreground rounded-full origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)`, transition: 'transform 0.5s ease-out' }}
          />

          {/* Second Hand */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-14 bg-red-500 origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(${secondRotation}deg)`, transition: 'transform 0.2s linear' }}
          />
        </>
      )}

      {/* Center Dot */}
      <div
        className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-background" />
    </div>
  );
}
