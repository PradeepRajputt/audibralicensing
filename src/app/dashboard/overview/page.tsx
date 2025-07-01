
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Youtube, Instagram, ShieldCheck, Globe } from "lucide-react";

const quickLinks = [
  {
    href: "https://studio.youtube.com/",
    label: "YouTube Studio",
    description: "Manage your YouTube channel, videos, and analytics.",
    icon: Youtube,
  },
  {
    href: "https://www.facebook.com/creators/tools/instagram",
    label: "Instagram Creator Tools",
    description: "Access tools and resources for growing on Instagram.",
    icon: Instagram,
  },
  {
    href: "https://www.tiktok.com/creators/",
    label: "TikTok Creator Portal",
    description: "Find tips, tricks, and updates for TikTok creators.",
    icon: Globe, // Using Globe as a placeholder for TikTok
  },
  {
    href: "https://support.google.com/youtube/answer/2807622",
    label: "YouTube Copyright School",
    description: "Learn the basics of copyright to avoid issues.",
    icon: ShieldCheck,
  },
];

export default function QuickLinksPage() {
  return (
    <div className="space-y-6">
       <div className="space-y-2">
        <h1 className="text-2xl font-bold">Quick Links</h1>
        <p className="text-muted-foreground">
          Helpful external resources for content creators.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
            <a href={item.href} key={item.href} className="group" target="_blank" rel="noopener noreferrer">
                <Card className="h-full text-center transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:-translate-y-1 flex flex-col">
                    <CardHeader className="flex-1">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-accent/10 rounded-full">
                                <item.icon className="w-12 h-12 text-accent" />
                            </div>
                        </div>
                        <CardTitle>{item.label}</CardTitle>
                        <CardDescription className="pt-2">{item.description}</CardDescription>
                    </CardHeader>
                </Card>
            </a>
        ))}
      </div>
    </div>
  );
}
