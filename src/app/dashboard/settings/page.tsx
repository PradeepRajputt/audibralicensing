'use client'

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Youtube, Instagram } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from "@/context/user-context"

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  email: z.string().email(),
});

const platformData = [
  {
    id: 'youtube',
    name: 'YouTube',
    account: 'MyAwesomeVlogs',
    icon: <Youtube className="w-8 h-8 text-red-600" />,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    account: 'InstaVlogs',
    icon: <Instagram className="w-8 h-8 text-pink-500" />,
  },
] as const;

type PlatformId = typeof platformData[number]['id'];

export default function SettingsPage() {
    const { toast } = useToast();
    const { avatarUrl, setAvatarUrl, displayName, setDisplayName } = useUser();
    const [activePlatform, setActivePlatform] = React.useState<PlatformId | null>('youtube');

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            displayName: displayName,
            email: "creator@example.com",
        },
    });

    React.useEffect(() => {
        form.reset({ displayName });
    }, [displayName, form]);

    function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        setDisplayName(values.displayName);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
    }

    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            toast({
                title: "Picture Updated",
                description: "Your new profile picture has been saved (simulated).",
            });
            setIsUploading(false);
        }, 1500);
    }
    
    const handlePlatformToggle = (platformId: PlatformId, isChecked: boolean) => {
        if (isChecked) {
            setActivePlatform(platformId);
            toast({
                title: "Platform Connection Updated",
                description: `You are now connected with ${platformData.find(p => p.id === platformId)?.name}.`,
            });
        }
    };


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Update your profile picture. Recommended size: 256x256px.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="profile picture" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                             <Input 
                                id="picture" 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                            />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Picture</Button>
                            <Button onClick={handleUpload} disabled={avatarUrl.startsWith('https://placehold.co') || isUploading}>
                                {isUploading ? 'Uploading...' : 'Update Picture'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your display name and email address.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                <Input placeholder="Your Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder="your@email.com" {...field} disabled />
                                </FormControl>
                                <FormDescription>Your email address cannot be changed.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit">Update Profile</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Connected Platforms</CardTitle>
                    <CardDescription>Manage your connected social media and content platforms. Only one platform can be active at a time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {platformData.map((platform) => (
                        <div key={platform.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-4">
                                {platform.icon}
                                <div>
                                    <h3 className="font-semibold">{platform.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {activePlatform === platform.id ? platform.account : 'Not connected'}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={activePlatform === platform.id}
                                onCheckedChange={(isChecked) => handlePlatformToggle(platform.id, isChecked)}
                                aria-label={`Toggle ${platform.name} connection`}
                             />
                        </div>
                    ))}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Password</h3>
                            <p className="text-sm text-muted-foreground">Last changed on May 20, 2024</p>
                        </div>
                        <Button variant="outline">Change Password</Button>
                    </div>
                    <Separator />
                     <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Delete Account</h3>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
