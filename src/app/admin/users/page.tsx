
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '@/lib/users-store';
import type { User } from '@/lib/firebase/types';

// This is now a Server Component
export default function UserManagementPage() {
  // Fetch data directly on the server
  const users = getAllUsers();
  
  const getStatusInfo = (status: User['status']) => {
    switch (status) {
      case 'active':
        return { variant: 'default', text: 'Active' };
      case 'suspended':
        return { variant: 'secondary', text: 'Suspended' };
      case 'deactivated':
        return { variant: 'destructive', text: 'Deactivated' };
      default:
        return { variant: 'outline', text: 'Unknown' };
    }
  }

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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const statusInfo = getStatusInfo(user.status);
              return (
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
                <TableCell>
                  <Badge variant={statusInfo.variant}>
                     {statusInfo.text}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/users/${user.uid}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
