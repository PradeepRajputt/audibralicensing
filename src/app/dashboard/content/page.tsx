
'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileVideo, Globe, Youtube, Music, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getAllContent, type ProtectedContent } from '@/lib/content-store';

const platformIcons: Record<string, React.ReactNode> = {
    youtube: <Youtube className="h-5 w-5 text-red-500" />,
    vimeo: <FileVideo className="h-5 w-5 text-blue-400" />,
    web: <Globe className="h-5 w-5" />,
} as const;

const contentTypeBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    video: "default",
    audio: "secondary",
    text: "outline",
    image: "destructive"
} as const;


export default function ProtectedContentPage() {
  const [content, setContent] = React.useState<ProtectedContent[]>([]);

  React.useEffect(() => {
    const loadContent = () => {
      setContent(getAllContent());
    };
    loadContent();
    window.addEventListener('storage', loadContent);
    return () => {
      window.removeEventListener('storage', loadContent);
    }
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>My Protected Content</CardTitle>
            <CardDescription>
                A list of your content that CreatorShield is actively monitoring.
            </CardDescription>
        </div>
        <Button asChild>
            <Link href="/dashboard/content/new">
                <PlusCircle className="mr-2" />
                Add New Content
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-right">Upload Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.length > 0 ? content.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                    <Badge variant={contentTypeBadgeVariant[item.contentType]}>{item.contentType}</Badge>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {platformIcons[item.platform] || <FileVideo className="h-5 w-5" />}
                        <span className="capitalize">{item.platform}</span>
                    </div>
                </TableCell>
                <TableCell className="text-right">{new Date(item.uploadDate).toLocaleDateString()}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No content added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
