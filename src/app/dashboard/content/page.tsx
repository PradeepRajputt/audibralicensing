
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getAllContentForUser } from '@/lib/content-store';
import { ContentClientPage } from './content-client';
import type { ProtectedContent } from '@/lib/types';

export default async function ProtectedContentPage() {
  // In a real app, you would get the authenticated user's ID
  const userId = "user_creator_123";
  const rawContent = await getAllContentForUser(userId);
  const content = JSON.parse(JSON.stringify(rawContent)) as ProtectedContent[];

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">My Protected Content</h1>
            <p className="text-muted-foreground">
                A list of your content that CreatorShield is actively monitoring.
            </p>
        </div>
        <Button asChild>
            <Link href="/dashboard/content/new">
                <PlusCircle className="mr-2" />
                Add New Content
            </Link>
        </Button>
      </div>

      <ContentClientPage initialContent={content} />
    </div>
  );
}
