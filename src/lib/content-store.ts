
'use client';
import type { ProtectedContent } from '@/lib/firebase/types';

const CONTENT_KEY = 'creator_shield_content';

const initialContent: ProtectedContent[] = [
    {
        id: 'content_1',
        creatorId: 'user_creator_123',
        title: "My Most Epic Adventure Yet!",
        contentType: "video",
        platform: "youtube",
        uploadDate: new Date("2024-05-15").toISOString(),
        videoURL: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        tags: ["adventure", "travel"]
    },
    {
        id: 'content_2',
        creatorId: 'user_creator_123',
        title: "How to Bake the Perfect Sourdough",
        contentType: "video",
        platform: "youtube",
        uploadDate: new Date("2024-04-22").toISOString(),
        videoURL: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        tags: ["baking", "cooking", "sourdough"]
    },
    {
        id: 'content_3',
        creatorId: 'user_creator_123',
        title: "My Travel Blog - Summer in Italy",
        contentType: "text",
        platform: "web",
        uploadDate: new Date("2024-03-10").toISOString(),
        videoURL: "https://myblog.com/italy-2024",
        tags: ["travel", "italy", "blog"]
    },
    {
        id: 'content_4',
        creatorId: 'user_creator_456',
        title: "Acoustic Guitar Session",
        contentType: "audio",
        platform: "vimeo",
        uploadDate: new Date("2024-02-01").toISOString(),
        videoURL: "https://vimeo.com/123456",
        tags: ["music", "acoustic", "guitar"]
    }
];

function getContentFromStorage(): ProtectedContent[] {
  if (typeof window === 'undefined') return initialContent;
  
  const stored = localStorage.getItem(CONTENT_KEY);
  if (!stored) {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(initialContent));
    return initialContent;
  }
  return JSON.parse(stored);
}

function saveContentToStorage(content: ProtectedContent[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event('storage'));
}

export function getAllContent(): ProtectedContent[] {
    const content = getContentFromStorage();
    return content.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
}

export function addContent(data: Omit<ProtectedContent, 'id' | 'creatorId' | 'uploadDate'>) {
    const content = getContentFromStorage();
    const newContent: ProtectedContent = {
        ...data,
        id: `content_${Date.now()}`,
        creatorId: 'user_creator_123', // Mock current user
        uploadDate: new Date().toISOString(),
    };
    saveContentToStorage([newContent, ...content]);
}
