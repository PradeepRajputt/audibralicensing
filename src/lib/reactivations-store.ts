
'use server';
import type { ReactivationRequest } from '@/lib/types';

// In-memory store for prototype purposes. NOT persistent.
let requests: ReactivationRequest[] = [
    {
        creatorId: "user_creator_xyz", 
        displayName: "Deleted User",
        email: "deleted@example.com",
        avatar: "https://placehold.co/128x128.png",
        requestDate: new Date('2024-05-28').toISOString(),
    }
];

export function getAllReactivationRequests(): ReactivationRequest[] {
    return requests;
}

export function addReactivationRequest(request: ReactivationRequest) {
  if (!requests.some(r => r.creatorId === request.creatorId)) {
    requests.push(request);
  }
}

export function removeReactivationRequest(creatorId: string) {
    requests = requests.filter(r => r.creatorId !== creatorId);
}
