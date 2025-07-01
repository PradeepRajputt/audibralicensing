
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
