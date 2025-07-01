
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AnalogClock } from '@/components/ui/analog-clock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const timezones = [
    { value: 'UTC', label: '🌍 Coordinated Universal Time (UTC)' },
    { value: 'America/New_York', label: '🇺🇸 New York (EST)' },
    { value: 'Europe/London', label: '🇬🇧 London (GMT)' },
    { value: 'Europe/Paris', label: '🇫🇷 Paris (CET)' },
    { value: 'Asia/Kolkata', label: '🇮🇳 India (IST)' },
    { value: 'Asia/Tokyo', label: '🇯🇵 Tokyo (JST)' },
    { value: 'Australia/Sydney', label: '🇦🇺 Sydney (AEST)' },
];

export function DashboardHeader() {
  const [timeZone, setTimeZone] = React.useState('UTC');
  const [selectedTimezoneLabel, setSelectedTimezoneLabel] = React.useState('🌍 Coordinated Universal Time (UTC)');

  const handleTimeZoneChange = (value: string) => {
    const selected = timezones.find(tz => tz.value === value);
    setTimeZone(value);
    setSelectedTimezoneLabel(selected?.label || 'UTC');
  }

  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
                <AnalogClock timeZone={timeZone} className="w-16 h-16" />
                <p className="text-xs text-muted-foreground">{selectedTimezoneLabel}</p>
            </div>
             <Select onValueChange={handleTimeZoneChange} defaultValue={timeZone}>
                <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                    {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
     </header>
  );
}
