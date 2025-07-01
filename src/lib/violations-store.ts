
'use server';
import type { Violation } from '@/lib/types';

// In-memory array to store violations
let violations: Violation[] = [
    {
        id: "violation_1",
        creatorId: "user_creator_123",
        matchedURL: "https://infringing-site.com/stolen-video-1",
        platform: "web",
        matchScore: 0.98,
        detectedAt: new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString(), // 2 hours ago
        status: 'pending_review',
    },
    {
        id: "violation_2",
        creatorId: "user_creator_123",
        matchedURL: "https://youtube.com/watch?v=reuploaded",
        platform: "youtube",
        matchScore: 0.92,
        detectedAt: new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString(), // 1 day ago
        status: 'pending_review',
    },
    {
        id: "violation_3",
        creatorId: "user_creator_123",
        matchedURL: "https://instagram.com/p/copiedreel",
        platform: "instagram",
        matchScore: 0.88,
        detectedAt: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 days ago
        status: 'pending_review',
    }
];

export async function createViolation(data: Omit<Violation, 'id' | 'detectedAt'>): Promise<Violation> {
    const newViolation: Violation = {
        ...data,
        id: `violation_${Date.now()}`,
        detectedAt: new Date().toISOString(),
    };
    violations.unshift(newViolation);
    return JSON.parse(JSON.stringify(newViolation));
}

export async function getViolationsForUser(creatorId: string): Promise<Violation[]> {
    const userViolations = violations.filter(v => v.creatorId === creatorId);
    return JSON.parse(JSON.stringify(userViolations));
}
