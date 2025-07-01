'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AnalogClock } from '@/components/ui/analog-clock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'New York (EST)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const countryFlags: { [key: string]: string } = {
    'UTC': '🌐',
    'America/New_York': '🇺🇸',
    'Europe/London': '🇬🇧',
    'Europe/Paris': '🇫🇷',
    'Asia/Kolkata': '🇮🇳',
    'Asia/Tokyo': '🇯🇵',
    'Australia/Sydney': '🇦🇺',
};

export function DashboardHeader() {
  const [selectedTimezone, setSelectedTimezone] = React.useState('UTC');
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const timerId = setInterval(() => {
        const now = new Date();
        try {
            const timeString = now.toLocaleTimeString('en-US', {
                timeZone: selectedTimezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
            setCurrentTime(timeString);
        } catch (e) {
            console.error(`Invalid timezone: ${selectedTimezone}`);
            // Fallback to local time if timezone is invalid
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            }));
        }
    }, 1000);
    return () => clearInterval(timerId);
  }, [selectedTimezone]);
  
  const selectedLabel = timezones.find(tz => tz.value === selectedTimezone)?.label;

  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
            <AnalogClock timeZone={selectedTimezone} className="w-24 h-24" />
            <div className="flex flex-col gap-1 items-center">
                <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                        {timezones.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{countryFlags[tz.value]}</span>
                                    <span>{tz.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedLabel && (
                  <div className="text-sm font-medium text-center text-muted-foreground mt-2">
                    <span className="text-lg">{countryFlags[selectedTimezone]}</span> {selectedLabel}
                  </div>
                )}
                <p className="text-center font-mono text-lg mt-1">{currentTime}</p>
            </div>
        </div>
     </header>
  );
}
