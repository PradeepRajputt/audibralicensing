
'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle, XCircle, AlertCircle, CircleSlash } from "lucide-react";
import Link from "next/link";
import { getAllUsers, type User } from '@/lib/users-store';
import { getCreatorStatuses, type CreatorStatus } from './actions';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type UserWithYTStatus = User & { ytStatus?: CreatorStatus['status'] };

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<UserWithYTStatus[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Load initial static user data
    const initialUsers = getAllUsers();
    setUsers(initialUsers);
    
    // Fetch real-time statuses from the YouTube API via a server action
    getCreatorStatuses(initialUsers).then(statuses => {
      setUsers(currentUsers => 
        currentUsers.map(user => {
          const statusUpdate = statuses.find(s => s.uid === user.uid);
          return statusUpdate ? { ...user, ytStatus: statusUpdate.status } : user;
        })
      );
      setIsLoading(false);
    });
  }, []);

  const statusMap: Record<CreatorStatus['status'], { icon: React.ElementType, color: string, text: string, variant: "default" | "secondary" | "destructive" }> = {
    'Active': { icon: CheckCircle, color: 'text-green-500', text: 'Active', variant: 'default' },
    'Not Found': { icon: XCircle, color: 'text-red-500', text: 'Not Found', variant: 'destructive' },
    'Not Connected': { icon: CircleSlash, color: 'text-muted-foreground', text: 'Not Connected', variant: 'secondary' },
    'Error': { icon: AlertCircle, color: 'text-yellow-500', text: 'API Error', variant: 'secondary' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Creator Management</CardTitle>
        <CardDescription>
          A list of all creators on the CreatorShield platform with their real-time YouTube status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>YouTube Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const statusInfo = user.ytStatus ? statusMap[user.ytStatus] : null;

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
                  {isLoading ? <Skeleton className="h-5 w-24" /> : (
                    statusInfo && (
                       <Badge variant={statusInfo.variant}>
                         <statusInfo.icon className="mr-1 h-3 w-3" />
                         {statusInfo.text}
                       </Badge>
                    )
                  )}
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
