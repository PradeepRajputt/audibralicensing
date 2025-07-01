
'use server';
import type { Violation } from '@/lib/types';

// In-memory array to store violations
let violations: Violation[] = [
    {
        id: "violation_1",
        creatorId: "user_creator_123",
        originalContentTitle: "My Most Epic Adventure Yet!",
        originalContentUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        infringingContentSnippet: "https://placehold.co/300x200.png",
        matchedURL: "https://infringing-site.com/stolen-video-1",
        platform: "web",
        matchScore: 0.98,
        detectedAt: new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString(), // 2 hours ago
        status: 'pending_review',
        timeline: [
            { status: "Detected", date: new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString() }
        ]
    },
    {
        id: "violation_2",
        creatorId: "user_creator_123",
        originalContentTitle: "How to Bake the Perfect Sourdough",
        originalContentUrl: "https://youtube.com/watch?v=some_other_id",
        infringingContentSnippet: "A direct re-upload of my entire video, including my intro and outro...",
        matchedURL: "https://youtube.com/watch?v=reuploaded",
        platform: "youtube",
        matchScore: 0.92,
        detectedAt: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString(), // 1 day ago
        status: 'pending_review',
        timeline: [
            { status: "Detected", date: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString() }
        ]
    },
    {
        id: "violation_3",
        creatorId: "user_creator_123",
        originalContentTitle: "My Travel Blog - Summer in Italy",
        originalContentUrl: "https://myblog.com/italy-summer",
        infringingContentSnippet: "They used my background music without credit in their latest reel...",
        matchedURL: "https://instagram.com/p/copiedreel",
        platform: "instagram",
        matchScore: 0.88,
        detectedAt: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 days ago
        status: 'action_taken',
        timeline: [
            { status: "Detected", date: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString() },
            { status: "Reported", date: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString() }
        ]
    },
     {
        id: "violation_4",
        creatorId: "user_creator_123",
        originalContentTitle: "Acoustic Guitar Session",
        originalContentUrl: "https://vimeo.com/12345678",
        infringingContentSnippet: "This user has taken my audio and put it over their own visuals on TikTok.",
        matchedURL: "https://tiktok.com/@user/copied-clip",
        platform: "tiktok",
        matchScore: 0.76,
        detectedAt: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)).toISOString(),
        status: 'dismissed',
        timeline: [
            { status: "Detected", date: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)).toISOString() },
            { status: "Dismissed", date: new Date(Date.now() - (13 * 24 * 60 * 60 * 1000)).toISOString() }
        ]
    }
];

export async function createViolation(data: Omit<Violation, 'id' | 'detectedAt' | 'timeline'>): Promise<Violation> {
    const newViolation: Violation = {
        ...data,
        id: `violation_${Date.now()}`,
        detectedAt: new Date().toISOString(),
        timeline: [{ status: "Detected", date: new Date().toISOString() }],
    };
    violations.unshift(newViolation);
    return JSON.parse(JSON.stringify(newViolation));
}

export async function getViolationsForUser(creatorId: string): Promise<Violation[]> {
    const userViolations = violations.filter(v => v.creatorId === creatorId);
    return JSON.parse(JSON.stringify(userViolations.sort((a,b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())));
}
