
'use server';
import type { Violation } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

let mockViolations: Violation[] = [
    {
        id: 'violation_1',
        creatorId: 'user_creator_123',
        originalContentTitle: 'My Most Epic Adventure Yet!',
        originalContentUrl: 'https://youtube.com/watch?v=original123',
        infringingContentSnippet: 'A direct copy of the first 5 minutes of my video.',
        matchedURL: 'https://some-other-site.com/stolen-video',
        platform: 'web',
        matchScore: 0.95,
        detectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'pending_review',
        timeline: [{ status: 'Detected', date: new Date(Date.now() - 86400000 * 2).toISOString() }]
    },
    {
        id: 'violation_2',
        creatorId: 'user_creator_123',
        originalContentTitle: 'How to Bake the Perfect Sourdough',
        originalContentUrl: 'https://youtube.com/watch?v=original456',
        infringingContentSnippet: 'https://placehold.co/600x400.png',
        matchedURL: 'https://instagram.com/p/copied-image',
        platform: 'instagram',
        matchScore: 0.99,
        detectedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: 'action_taken',
        timeline: [
            { status: 'Detected', date: new Date(Date.now() - 86400000 * 5).toISOString() },
            { status: 'Reported', date: new Date(Date.now() - 86400000 * 4).toISOString() }
        ]
    }
];

export async function createViolation(data: Omit<Violation, 'id' | 'detectedAt' | 'timeline'>): Promise<Violation> {
    noStore();
    const newViolation: Violation = {
        ...data,
        id: `violation_${Date.now()}`,
        detectedAt: new Date().toISOString(),
        timeline: [{ status: "Detected", date: new Date().toISOString() }],
    };
    mockViolations.unshift(newViolation);
    console.log(`MOCK: Stored violation with ID: ${newViolation.id}`);
    return Promise.resolve(newViolation);
}

export async function getViolationsForUser(creatorId: string): Promise<Violation[]> {
    noStore();
    console.log(`MOCK: Fetching violations for user ${creatorId}`);
    return Promise.resolve(
        mockViolations.filter(v => v.creatorId === creatorId)
                      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    );
}

export async function updateViolationStatus(violationId: string, status: Violation['status']): Promise<void> {
    noStore();
    const violation = mockViolations.find(v => v.id === violationId);
    if (!violation) {
        console.error(`Violation with ID ${violationId} not found.`);
        throw new Error("Violation not found and could not be updated.");
    }
    const statusText = status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    violation.status = status;
    violation.timeline.push({ status: statusText, date: new Date().toISOString() });
    console.log(`MOCK: Updated violation ${violationId} to status ${status}`);
}
