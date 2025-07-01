
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileVideo, Globe, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getAllContentForUser } from '@/lib/content-store';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const platformIcons: Record<string, React.ReactNode> = {
    youtube: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>,
    vimeo: <FileVideo className="h-5 w-5 text-blue-400" />,
    web: <Globe className="h-5 w-5" />,
} as const;

const contentTypeBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    video: "default",
    audio: "secondary",
    text: "outline",
    image: "destructive"
} as const;


export default async function ProtectedContentPage() {
  const session = await getServerSession(authOptions);
  // Fetch content only if a user session exists.
  const content = session?.user?.id ? await getAllContentForUser(session.user.id) : [];

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
