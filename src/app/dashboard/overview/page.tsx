'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanSearch, FileText, ShieldCheck, Clock, Home } from "lucide-react";
import Link from 'next/link';
import { useUser } from "@/context/user-context";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// A representative list of timezones
const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'New York (EST)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export default function OverviewPage() {
  const { avatarUrl, displayName } = useUser();
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');

  useEffect(() => {
    // This effect runs only on the client, avoiding hydration mismatch
    const timer = setInterval(() => {
      const timeString = new Date().toLocaleTimeString('en-US', {
        timeZone: selectedTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeString);
    }, 1000);

    // Cleanup function to clear the interval when the component unmounts or timezone changes
    return () => clearInterval(timer);
  }, [selectedTimezone]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="profile picture" />
            <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
            <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
            <p className="text-muted-foreground">What would you like to accomplish today?</p>
            </div>
        </div>

        <Card className="min-w-[280px]">
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                <Clock className="h-6 w-6 text-muted-foreground" />
                <Select onValueChange={setSelectedTimezone} defaultValue={selectedTimezone}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                        {timezones.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-center">
                    {currentTime || 'Loading...'}
                </div>
            </CardContent>
        </Card>
      </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/monitoring" className="group">
          <Card className="h-full text-left transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
            <CardHeader>
                <div className="p-3 bg-accent/10 rounded-full self-start">
                    <ScanSearch className="w-8 h-8 text-accent" />
                </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl">Scan a Web Page</CardTitle>
              <CardDescription className="mt-2">
                Check a specific URL for potential copyright infringements against your content.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/reports" className="group">
          <Card className="h-full text-left transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
             <CardHeader>
                <div className="p-3 bg-accent/10 rounded-full self-start">
                    <FileText className="w-8 h-8 text-accent" />
                </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl">Submit a Manual Report</CardTitle>
              <CardDescription className="mt-2">
                Found a violation our system missed? Report it manually for review.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/violations" className="group">
          <Card className="h-full text-left transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
            <CardHeader>
                <div className="p-3 bg-accent/10 rounded-full self-start">
                    <ShieldCheck className="w-8 h-8 text-accent" />
                </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl">Review Detected Violations</CardTitle>
              <CardDescription className="mt-2">
                View a list of all potential violations found by our automated scans.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
