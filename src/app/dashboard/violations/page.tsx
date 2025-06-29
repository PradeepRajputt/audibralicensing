'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const violations = [
  {
    url: "https://infringing-site.com/stolen-video-1",
    platform: "web",
    score: 0.98,
    status: "pending_review",
    detectedAt: "2 hours ago",
  },
  {
    url: "https://youtube.com/watch?v=reuploaded",
    platform: "youtube",
    score: 0.92,
    status: "pending_review",
    detectedAt: "1 day ago",
  },
  {
    url: "https://badsite.net/my-audio-track",
    platform: "web",
    score: 0.85,
    status: "action_taken",
    detectedAt: "5 days ago",
  },
  {
    url: "https://tiktok.com/@user/copied-clip",
    platform: "tiktok",
    score: 0.76,
    status: "dismissed",
    detectedAt: "2 weeks ago",
  },
];

const statusVariant = {
    pending_review: "secondary",
    action_taken: "default",
    dismissed: "outline"
} as const

export default function ViolationsPage() {
    const { toast } = useToast();

    const handleAction = (action: string, url: string) => {
        toast({
            title: `Action: ${action}`,
            description: `An action has been simulated for the violation at: ${url}`,
        });
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
              <TableHead className="w-[45%]">Infringing URL</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Detected</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.map((item) => (
              <TableRow key={item.url}>
                <TableCell className="font-medium truncate max-w-sm">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.url}
                    </a>
                </TableCell>
                <TableCell><span className="capitalize">{item.platform}</span></TableCell>
                <TableCell>{(item.score * 100).toFixed(0)}%</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[item.status as keyof typeof statusVariant]}>{item.status.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>{item.detectedAt}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleAction('Submit Strike', item.url)}>
                                    Submit Copyright Strike
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleAction('Dismiss', item.url)} className="text-destructive focus:text-destructive">
                                    Dismiss Violation
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <span>-</span>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
