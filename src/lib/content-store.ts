
'use client';

export type ProtectedContent = {
  id: string;
  title: string;
  contentType: string;
  platform: string;
  uploadDate: string;
};

const CONTENT_KEY = 'creator_shield_content';

const initialContent: ProtectedContent[] = [
    {
      id: "content_1",
      title: "My Most Epic Adventure Yet!",
      contentType: "video",
      platform: "youtube",
      uploadDate: "2024-05-15",
    },
    {
      id: "content_2",
      title: "How to Bake the Perfect Sourdough",
      contentType: "video",
      platform: "youtube",
      uploadDate: "2024-04-22",
    },
    {
      id: "content_3",
      title: "My Travel Blog - Summer in Italy",
      contentType: "text",
      platform: "web",
      uploadDate: "2024-03-10",
    },
    {
      id: "content_4",
      title: "Acoustic Guitar Session",
      contentType: "audio",
      platform: "vimeo",
      uploadDate: "2024-02-01",
    },
];

function getContentFromStorage(): ProtectedContent[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const contentJSON = localStorage.getItem(CONTENT_KEY);
  if (!contentJSON) {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(initialContent));
    return initialContent;
  }
  return JSON.parse(contentJSON);
}

function saveContentToStorage(content: ProtectedContent[]) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event('storage'));
}

export function getAllContent(): ProtectedContent[] {
  return getContentFromStorage().sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
}

export function addContent(data: Omit<ProtectedContent, 'id' | 'uploadDate'>): ProtectedContent {
  const allContent = getContentFromStorage();
  const newContent: ProtectedContent = {
    ...data,
    id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    uploadDate: new Date().toISOString().split('T')[0],
  };
  const updatedContent = [newContent, ...allContent];
  saveContentToStorage(updatedContent);
  return newContent;
}
