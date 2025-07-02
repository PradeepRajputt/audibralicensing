
'use server';
import type { ReactivationRequest } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

let mockReactivationRequests: ReactivationRequest[] = [
    { 
        creatorId: 'user_creator_xyz', 
        displayName: 'Deleted User', 
        email: 'deleted@example.com', 
        avatar: 'https://placehold.co/128x128.png', 
        requestDate: new Date('2024-05-28T12:00:00.000Z').toISOString() 
    }
];

export async function getAllReactivationRequests(): Promise<ReactivationRequest[]> {
    noStore();
    console.log("MOCK: Fetching all reactivation requests.");
    return Promise.resolve(mockReactivationRequests);
}

export async function addReactivationRequest(request: Omit<ReactivationRequest, 'requestDate'>): Promise<void> {
    noStore();
    const newRequest: ReactivationRequest = {
        ...request,
        requestDate: new Date().toISOString(),
    };
    // Remove existing request if present, then add the new one
    mockReactivationRequests = mockReactivationRequests.filter(r => r.creatorId !== request.creatorId);
    mockReactivationRequests.push(newRequest);
    console.log(`MOCK: Adding/updating reactivation request for ${request.creatorId}`);
}

export async function removeReactivationRequest(creatorId: string): Promise<void> {
    noStore();
    mockReactivationRequests = mockReactivationRequests.filter(r => r.creatorId !== creatorId);
    console.log(`MOCK: Removing reactivation request for ${creatorId}`);
}
