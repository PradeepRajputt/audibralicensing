'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, FileText, Video as FileVideo, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Violation } from '@/lib/types';
import { getViolationsForUser, updateViolationStatus } from '@/lib/violations-store';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';

const statusMapping: Record<Violation['status'], { text: string; variant: "secondary" | "default" | "outline" }> = {
    pending_review: { text: "New", variant: "secondary" },
    action_taken: { text: "Reported", variant: "default" },
    dismissed: { text: "Ignored", variant: "outline" }
};

const platformIcons: Record<string, React.ReactNode> = {
    youtube: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>,
    vimeo: <FileVideo className="h-5 w-5 text-blue-400" />,
    instagram: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram h-5 w-5 text-pink-500"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>,
    tiktok: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music h-5 w-5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
    web: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>,
} as const;

function formatStatus(status: string) {
    return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export default function ViolationsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [violations, setViolations] = useState<Violation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            getViolationsForUser(user.uid).then(data => {
                setViolations(JSON.parse(JSON.stringify(data)));
                setIsLoading(false);
            });
        }
    }, [user]);

    const handleAction = async (action: 'dismiss' | 'report', violationId: string) => {
        let newStatus: Violation['status'] = 'pending_review';
        let toastTitle = '';
        let toastDescription = '';

        if (action === 'dismiss') {
            newStatus = 'dismissed';
            toastTitle = 'Violation Dismissed';
            toastDescription = 'You will no longer see this violation.'
        } else if (action === 'report') {
            newStatus = 'action_taken';
            toastTitle = 'Violation Reported';
            toastDescription = 'A report has been generated for this violation.'
        }
        
        try {
            await updateViolationStatus(violationId, newStatus);
            setViolations(prev => prev.map(v => v.id === violationId ? {...v, status: newStatus, timeline: [...v.timeline, { status: newStatus, date: new Date().toISOString() }]} : v));
            toast({
                title: toastTitle,
                description: toastDescription,
            });

        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Action Failed",
                description: "Could not update the violation status. Please try again.",
            });
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detected Violations</CardTitle>
        <CardDescription>
          A list of potential copyright violations detected by our automated system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Matched Content</TableHead>
              <TableHead className="w-[30%]">Infringing URL</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.length > 0 ? violations.map((item) => {
                const statusInfo = statusMapping[item.status];
                const reportUrl = `/dashboard/reports?url=${encodeURIComponent(item.matchedURL)}&platform=${item.platform}`;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            {item.infringingContentSnippet.startsWith('https://') ? (
                               <Image src={item.infringingContentSnippet} alt="Matched content" width={64} height={64} className="rounded-md object-cover h-16 w-16" data-ai-hint="video content" />
                            ) : (
                                <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center p-2">
                                   <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                             <div>
                                <a href={item.originalContentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold">{item.originalContentTitle}</a>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{item.infringingContentSnippet.startsWith('https://') ? 'Image/Video match' : `Text: "${item.infringingContentSnippet}"`}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <a href={item.matchedURL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block max-w-xs">
                            {item.matchedURL}
                        </a>
                        <div className="flex items-center gap-1.5 mt-1">
                            {platformIcons[item.platform]}
                            <span className="text-xs text-muted-foreground capitalize">{item.platform}</span>
                        </div>
                    </TableCell>
                    <TableCell>{(item.matchScore * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                       {item.timeline.map((event, i) => (
                          <div key={i}>{new Date(event.date).toLocaleDateString()}: {formatStatus(event.status)}</div>
                        ))}
                    </TableCell>
                    <TableCell className="text-right">
                        {item.status === 'pending_review' ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                        <Link href={reportUrl}>Generate Report</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleAction('dismiss', item.id)} className="text-destructive focus:text-destructive">
                                        Dismiss Violation
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <span>-</span>
                        )}
                    </TableCell>
                  </TableRow>
                )
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No violations detected yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
