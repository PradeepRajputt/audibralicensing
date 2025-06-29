import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanSearch, FileText, ShieldCheck } from "lucide-react";
import Link from 'next/link';

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="https://placehold.co/128x128.png" alt="User Avatar" data-ai-hint="profile picture" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Sample Creator!</h1>
          <p className="text-muted-foreground">What would you like to accomplish today?</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/monitoring" className="group">
          <Card className="h-full text-left transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
            <CardHeader>
                <div className="p-3 bg-accent/10 rounded-full self-start">
                    <ScanSearch className="w-8 h-8 text-accent" />
                </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl">Scan a Web Page</CardTitle>
              <CardDescription className="mt-2">
                Check a specific URL for potential copyright infringements against your content.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/reports" className="group">
          <Card className="h-full text-left transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
             <CardHeader>
                <div className="p-3 bg-accent/10 rounded-full self-start">
                    <FileText className="w-8 h-8 text-accent" />
                </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl">Submit a Manual Report</CardTitle>
              <CardDescription className="mt-2">
                Found a violation our system missed? Report it manually for review.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/violations" className="group">
          <Card className="h-full text-left transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1">
            <CardHeader>
                <div className="p-3 bg-accent/10 rounded-full self-start">
                    <ShieldCheck className="w-8 h-8 text-accent" />
                </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl">Review Detected Violations</CardTitle>
              <CardDescription className="mt-2">
                View a list of all potential violations found by our automated scans.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
