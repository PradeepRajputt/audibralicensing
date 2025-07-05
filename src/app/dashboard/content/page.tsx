
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { getAllContentForUser } from '@/lib/content-store';
import { ContentClientPage } from './content-client';
import type { ProtectedContent } from '@/lib/types';
import { useEffect, useState } from "react";

export default function ProtectedContentPage() {
  const [content, setContent] = useState<ProtectedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Using a mock user ID as auth has been removed
    const userId = "user_creator_123";
    getAllContentForUser(userId).then(data => {
        setContent(JSON.parse(JSON.stringify(data)));
        setIsLoading(false);
    });
  }, []);


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
        
        {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
            <ContentClientPage initialContent={content} />
        )}
    </div>
  );
}
