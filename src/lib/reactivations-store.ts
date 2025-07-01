
'use server';
import type { ReactivationRequest } from '@/lib/types';

let reactivationRequests: ReactivationRequest[] = [
    {
      creatorId: 'user_creator_deactivated',
      displayName: 'Online Wlallah',
      email: 'guddumis003@gmail.com',
      avatar: 'https://placehold.co/128x128.png',
      requestDate: new Date('2024-06-12T10:00:00Z').toISOString(),
    },
];

export async function getAllReactivationRequests(): Promise<ReactivationRequest[]> {
    return JSON.parse(JSON.stringify(reactivationRequests));
}

export async function addReactivationRequest(request: Omit<ReactivationRequest, 'requestDate'>): Promise<void> {
    const existingIndex = reactivationRequests.findIndex(r => r.creatorId === request.creatorId);
    const newRequest = {
        ...request,
        requestDate: new Date().toISOString(),
    };
    if (existingIndex > -1) {
        reactivationRequests[existingIndex] = newRequest;
    } else {
        reactivationRequests.push(newRequest);
    }
}

export async function removeReactivationRequest(creatorId: string): Promise<void> {
    reactivationRequests = reactivationRequests.filter(r => r.creatorId !== creatorId);
}
