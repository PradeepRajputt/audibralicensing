
'use client';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { ContentClientPage } from './content-client';
import type { ProtectedContent } from '@/lib/types';
import { jwtDecode } from "jwt-decode";

export default function ProtectedContentPage() {
  const { data: session } = useSession();
  const [content, setContent] = useState<ProtectedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        // Get email from session or JWT
        let email = session?.user?.email;
        if (!email && typeof window !== "undefined") {
          const token = localStorage.getItem("creator_jwt");
          if (token) {
            try {
              const decoded: any = jwtDecode(token);
              email = decoded.email;
            } catch {}
          }
        }
        if (email) {
          const res = await fetch(`/api/creator-by-email?email=${email}`);
          if (!res.ok) throw new Error('Failed to fetch user info');
          const user = await res.json();
          if (user?.id) {
            const contentRes = await fetch(`/api/content?creatorId=${user.id}`);
            if (!contentRes.ok) throw new Error('Failed to fetch content');
            const contentList = await contentRes.json();
            setContent(contentList);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [session]);

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
        ) : error ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              {error}
            </div>
        ) : (
            <ContentClientPage initialContent={content} />
        )}
    </div>
  );
}
