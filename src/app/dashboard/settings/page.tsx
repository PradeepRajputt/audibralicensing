
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    icon: <Youtube className="w-8 h-8 text-red-600" />,
    inputLabel: 'YouTube Channel ID',
    inputPlaceholder: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="w-8 h-8 text-pink-500" />,
    inputLabel: 'Instagram Username',
    inputPlaceholder: '@username',
  },
] as const;

type PlatformId = typeof platformData[number]['id'];

export default function SettingsPage() {
    const { toast } = useToast();
    const { avatarUrl, setAvatarUrl, displayName, setDisplayName, youtubeId, setYoutubeId } = useUser();
    
    // State to manage which platform is active
    const [activePlatform, setActivePlatform] = React.useState<PlatformId | null>(null);
    
    // State to store details of connected accounts
    const [connectedAccounts, setConnectedAccounts] = React.useState<Partial<Record<PlatformId, { account: string }>>>({});

    // State to manage the connection dialog
    const [dialogState, setDialogState] = React.useState<{
        open: boolean;
        platform: typeof platformData[number] | null;
        inputValue: string;
    }>({ open: false, platform: null, inputValue: '' });

    React.useEffect(() => {
        // Sync local state with context on initial load and when context changes
        if (youtubeId) {
            setConnectedAccounts({ youtube: { account: youtubeId } });
            setActivePlatform('youtube');
        } else {
            setConnectedAccounts({});
            setActivePlatform(null);
        }
    }, [youtubeId]);


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
        if (!isChecked) {
            // A user cannot un-check an active switch. It deactivates when another is activated or by using the Disconnect button.
            return;
        }

        const isConnected = !!connectedAccounts[platformId];
        const platform = platformData.find(p => p.id === platformId);

        if (isConnected) {
            setActivePlatform(platformId);
            toast({
                title: "Platform Switched",
                description: `You are now monitoring ${platform?.name}.`,
            });
        } else {
            if (platform) {
                setDialogState({ open: true, platform, inputValue: '' });
            }
        }
    };

    const handleConnectPlatform = () => {
        if (!dialogState.platform || !dialogState.inputValue) return;

        const { platform, inputValue } = dialogState;

        // Save the connected account details
        setConnectedAccounts(prev => ({
            ...prev,
            [platform.id]: { account: inputValue }
        }));
        setActivePlatform(platform.id);

        if (platform.id === 'youtube') {
            setYoutubeId(inputValue);
        }

        toast({
            title: "Platform Connected",
            description: `${platform.name} has been successfully connected.`
        });

        // Close and reset the dialog
        setDialogState({ open: false, platform: null, inputValue: '' });
    };

    const handleDisconnect = (platformId: PlatformId) => {
        const platform = platformData.find(p => p.id === platformId);
        
        setConnectedAccounts(prev => {
            const newAccounts = { ...prev };
            delete newAccounts[platformId];
            return newAccounts;
        });

        if (activePlatform === platformId) {
            setActivePlatform(null);
        }

        if (platformId === 'youtube') {
            setYoutubeId(null);
        }

        toast({
            title: "Platform Disconnected",
            description: `${platform?.name} has been disconnected.`
        });
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
                                        {connectedAccounts[platform.id] 
                                            ? `Connected as ${connectedAccounts[platform.id]?.account}` 
                                            : 'Not connected'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={activePlatform === platform.id}
                                    onCheckedChange={(isChecked) => handlePlatformToggle(platform.id, isChecked)}
                                    aria-label={`Toggle ${platform.name} connection`}
                                 />
                                 {connectedAccounts[platform.id] && (
                                    <Button variant="ghost" size="sm" onClick={() => handleDisconnect(platform.id)}>Disconnect</Button>
                                 )}
                             </div>
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

            {/* Connection Dialog */}
            <Dialog 
                open={dialogState.open} 
                onOpenChange={(isOpen) => !isOpen && setDialogState({ open: false, platform: null, inputValue: '' })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Connect to {dialogState.platform?.name}</DialogTitle>
                        <DialogDescription>
                            Please provide your {dialogState.platform?.name} details to begin monitoring.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="platform-detail" className="text-right">
                                {dialogState.platform?.inputLabel}
                            </Label>
                            <Input
                                id="platform-detail"
                                placeholder={dialogState.platform?.inputPlaceholder}
                                value={dialogState.inputValue}
                                onChange={(e) => setDialogState(prev => ({...prev, inputValue: e.target.value}))}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleConnectPlatform} disabled={!dialogState.inputValue}>Connect Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
