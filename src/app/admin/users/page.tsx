
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import Link from "next/link";

// Mock user data. In a real application, this would be fetched from Firestore.
const users = [
  {
    uid: "user_creator_123",
    displayName: "Sample Creator",
    email: "creator@example.com",
    role: "creator",
    joinDate: "2024-01-15",
    avatar: "https://placehold.co/128x128.png",
  },
  {
    uid: "user_creator_456",
    displayName: "Alice Vlogs",
    email: "alice@example.com",
    role: "creator",
    joinDate: "2024-02-20",
    avatar: "https://placehold.co/128x128.png",
  },
  {
    uid: "user_creator_789",
    displayName: "Bob Builds",
    email: "bob@example.com",
    role: "creator",
    joinDate: "2024-03-10",
    avatar: "https://placehold.co/128x128.png",
  },
];


export default function UserManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Creator Management</CardTitle>
        <CardDescription>
          A list of all creators on the CreatorShield platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} data-ai-hint="profile picture" />
                      <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.displayName}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/users/${user.uid}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
