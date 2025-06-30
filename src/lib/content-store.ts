
'use client';

import { db } from '@/lib/firebase/config';
import type { ProtectedContent } from '@/lib/firebase/types';
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

export type { ProtectedContent };

// This function now fetches from Firestore
export async function getAllContent(creatorId: string): Promise<ProtectedContent[]> {
    if (!db) {
        console.warn("Firestore is not initialized. Returning empty array.");
        return [];
    }
    const contentRef = collection(db, "protectedContent");
    const q = query(contentRef, where("creatorId", "==", creatorId));
    
    const querySnapshot = await getDocs(q);
    const content: ProtectedContent[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        content.push({
            contentId: doc.id,
            creatorId: data.creatorId,
            title: data.title,
            contentType: data.contentType,
            platform: data.platform,
            videoURL: data.videoURL,
            tags: data.tags,
            uploadDate: (data.uploadDate as Timestamp).toDate().toISOString(),
        });
    });

    return content.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
}

// addContent is now a server action in `src/app/dashboard/content/new/actions.ts`
// This file is now primarily for fetching data on the client if needed, and for types.
