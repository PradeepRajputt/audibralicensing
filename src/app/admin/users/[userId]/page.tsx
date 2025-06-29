
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldBan, Trash2, Youtube, Instagram, Globe } from "lucide-react";
import Link from 'next/link';

// Mock user data. In a real application, this would be fetched from Firestore.
const users = [
  {
    uid: "user_creator_123",
    displayName: "Sample Creator",
    email: "creator@example.com",
    role: "creator",
    joinDate: "2024-01-15",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "web"],
    youtubeId: "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
  },
  {
    uid: "user_creator_456",
    displayName: "Alice Vlogs",
    email: "alice@example.com",
    role: "creator",
    joinDate: "2024-02-20",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "instagram"],
    youtubeId: "UC-sample-channel-id",
  },
  {
    uid: "user_creator_789",
    displayName: "Bob Builds",
    email: "bob@example.com",
    role: "creator",
    joinDate: "2024-03-10",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["web"],
  },
];

const platformIcons = {
    youtube: <Youtube className="h-6 w-6 text-red-500" />,
    instagram: <Instagram className="h-6 w-6 text-pink-500" />,
    web: <Globe className="h-6 w-6" />,
    tiktok: <div className="h-6 w-6" /> // Placeholder for TikTok
} as const;


export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  const user = users.find(u => u.uid === params.userId);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested creator could not be found.</p>
          <Button asChild variant="link" className="px-0">
            <Link href="/admin/users">Return to Creator Management</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} data-ai-hint="profile picture" />
            <AvatarFallback>{user.displayName?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Back to Creator List</Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Creator Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creator ID</span>
              <span className="font-mono text-sm">{user.uid}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Join Date</span>
              <span>{new Date(user.joinDate).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {user.platformsConnected.length > 0 ? user.platformsConnected.map(platform => (
              <div key={platform} className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                {platformIcons[platform as keyof typeof platformIcons]}
                <span className="capitalize">{platform}</span>
              </div>
            )) : <p className="text-muted-foreground">No platforms connected.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Perform administrative actions on this creator account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-yellow-200/50 rounded-lg bg-yellow-50/10">
            <div>
              <h3 className="font-semibold">Suspend Creator</h3>
              <p className="text-sm text-muted-foreground">Temporarily disable the creator's account and access.</p>
            </div>
            <Button variant="outline"><ShieldBan className="mr-2" /> Suspend</Button>
          </div>
          <div className="flex items-center justify-between p-4 border-destructive/50 rounded-lg bg-destructive/10">
            <div>
              <h3 className="font-semibold text-destructive">Delete Creator</h3>
              <p className="text-sm text-muted-foreground">Permanently delete this creator and all associated data.</p>
            </div>
            <Button variant="destructive"><Trash2 className="mr-2" /> Delete</Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
