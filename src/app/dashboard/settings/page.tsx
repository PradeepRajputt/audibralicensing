'use client'

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

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  email: z.string().email(),
});

export default function SettingsPage() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            displayName: "Sample Creator",
            email: "creator@example.com",
        },
    });

    function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        console.log(values);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
    }

    return (
        <div className="space-y-6">
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
                    <CardDescription>Manage your connected social media and content platforms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                            <Youtube className="w-8 h-8 text-red-600" />
                            <div>
                                <h3 className="font-semibold">YouTube</h3>
                                <p className="text-sm text-muted-foreground">MyAwesomeVlogs</p>
                            </div>
                        </div>
                        <Switch defaultChecked={true} aria-label="Toggle YouTube connection" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                            <Instagram className="w-8 h-8 text-pink-500" />
                            <div>
                                <h3 className="font-semibold">Instagram</h3>
                                <p className="text-sm text-muted-foreground">Not connected</p>
                            </div>
                        </div>
                        <Switch defaultChecked={false} aria-label="Toggle Instagram connection" />
                    </div>
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
