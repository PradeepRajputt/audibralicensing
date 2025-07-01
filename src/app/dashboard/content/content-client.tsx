
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, RefreshCw, FileVideo, Music, FileText, Image as ImageIcon, Youtube, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteContentAction, rescanContentAction, updateContentTagsAction } from './actions';
import type { ProtectedContent } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

const platformIcons: Record<string, React.ReactNode> = {
    youtube: <Youtube className="h-5 w-5 text-red-500" />,
    vimeo: <FileVideo className="h-5 w-5 text-blue-400" />,
    web: <Globe className="h-5 w-5" />,
};

const contentTypeIcons: Record<string, React.ReactNode> = {
    video: <FileVideo className="h-4 w-4 mr-2" />,
    audio: <Music className="h-4 w-4 mr-2" />,
    text: <FileText className="h-4 w-4 mr-2" />,
    image: <ImageIcon className="h-4 w-4 mr-2" />,
};

const statusVariant: Record<string, "default" | "secondary"> = {
    active: "default",
    inactive: "secondary"
}

export function ContentClientPage({ initialContent }: { initialContent: ProtectedContent[] }) {
  const { toast } = useToast();
  const [content, setContent] = React.useState(initialContent);
  const [filter, setFilter] = React.useState('all');
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState<ProtectedContent | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const filteredContent = React.useMemo(() => {
    if (filter === 'all') return content;
    return content.filter(item => item.contentType === filter);
  }, [content, filter]);
  
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    const result = await deleteContentAction(id);
    if(result.success) {
      setContent(prev => prev.filter(item => item.id !== id));
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.message });
    }
    setIsDeleting(null);
  };
  
  const handleRescan = async (id: string) => {
      setIsScanning(id);
      const result = await rescanContentAction(id);
      if (result.success) {
          toast({ title: "Scan Initiated", description: result.message });
          // Optimistically update the UI or wait for revalidation
          setContent(prev => prev.map(item => item.id === id ? { ...item, lastChecked: new Date().toISOString() } : item));
      } else {
          toast({ variant: 'destructive', title: "Error", description: result.message });
      }
      setIsScanning(null);
  };
  
  const handleUpdateTags = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isEditing) return;
      setIsSaving(true);
      const formData = new FormData(event.currentTarget);
      const result = await updateContentTagsAction(isEditing.id, formData);

      if (result.success) {
          toast({ title: "Success", description: result.message });
          setContent(prev => prev.map(item => item.id === isEditing.id ? { ...item, tags: (formData.get('tags') as string).split(',').map(t=>t.trim()) } : item));
          setIsEditing(null);
      } else {
          toast({ variant: 'destructive', title: "Error", description: result.message });
      }
      setIsSaving(false);
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-end">
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                </SelectContent>
            </Select>
        </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContent.length > 0 ? (
              filteredContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center capitalize">
                       {contentTypeIcons[item.contentType]} {item.contentType}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 capitalize">
                        {platformIcons[item.platform]} {item.platform}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(item.lastChecked), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog open={isDeleting === item.id} onOpenChange={(open) => !open && setIsDeleting(null)}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setIsEditing(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Tags</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRescan(item.id)} disabled={isScanning === item.id}>
                            {isScanning === item.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            <span>Re-scan</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem className="text-destructive focus:text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                             <span>Delete</span>
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently remove this content from monitoring. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No content found. Add some content to start monitoring!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Update the tags for "{isEditing?.title}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTags} className="space-y-4 py-4">
              <div className="space-y-2">
                 <Label htmlFor="tags">Tags</Label>
                 <Input name="tags" id="tags" defaultValue={Array.isArray(isEditing?.tags) ? isEditing.tags.join(', ') : ''} placeholder="adventure, travel, vlog" />
                 <p className="text-sm text-muted-foreground">Comma-separated tags to help identify your content.</p>
              </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
