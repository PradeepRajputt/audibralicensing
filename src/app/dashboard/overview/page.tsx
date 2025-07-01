
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ScanSearch, FileVideo, ShieldAlert, FileText, Settings } from "lucide-react";
import Link from "next/link";

const overviewLinks = [
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart },
  { href: "/dashboard/content", label: "My Content", icon: FileVideo },
  { href: "/dashboard/monitoring", label: "Web Monitoring", icon: ScanSearch },
  { href: "/dashboard/violations", label: "Violations", icon: ShieldAlert },
  { href: "/dashboard/reports", label: "Submit Report", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
       <div className="space-y-2">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Quick links to all sections of your Creator Dashboard.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {overviewLinks.map((item) => (
            <Link href={item.href} key={item.href} className="group">
                <Card className="h-full text-center transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1 flex flex-col">
                    <CardHeader className="flex-1">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-accent/10 rounded-full">
                                <item.icon className="w-12 h-12 text-accent" />
                            </div>
                        </div>
                        <CardTitle>{item.label}</CardTitle>
                    </CardHeader>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
