import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileVideo, Globe, Youtube } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const protectedContent = [
  {
    title: "My Most Epic Adventure Yet!",
    contentType: "video",
    platform: "youtube",
    uploadDate: "2024-05-15",
  },
  {
    title: "How to Bake the Perfect Sourdough",
    contentType: "video",
    platform: "youtube",
    uploadDate: "2024-04-22",
  },
  {
    title: "My Travel Blog - Summer in Italy",
    contentType: "text",
    platform: "web",
    uploadDate: "2024-03-10",
  },
  {
    title: "Acoustic Guitar Session",
    contentType: "audio",
    platform: "vimeo",
    uploadDate: "2024-02-01",
  },
];

const platformIcons = {
    youtube: <Youtube className="h-5 w-5 text-red-500" />,
    vimeo: <FileVideo className="h-5 w-5 text-blue-400" />,
    web: <Globe className="h-5 w-5" />,
} as const;

const contentTypeBadgeVariant = {
    video: "default",
    audio: "secondary",
    text: "outline",
    image: "destructive"
} as const;


export default function ProtectedContentPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>My Protected Content</CardTitle>
            <CardDescription>
                A list of your content that CreatorShield is actively monitoring.
            </CardDescription>
        </div>
        <Button>
            <PlusCircle className="mr-2" />
            Add New Content
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
            {protectedContent.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                    <Badge variant={contentTypeBadgeVariant[item.contentType as keyof typeof contentTypeBadgeVariant]}>{item.contentType}</Badge>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {platformIcons[item.platform as keyof typeof platformIcons]}
                        <span className="capitalize">{item.platform}</span>
                    </div>
                </TableCell>
                <TableCell className="text-right">{new Date(item.uploadDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
