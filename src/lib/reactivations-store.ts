
'use client';
import type { ReactivationRequest } from '@/lib/firebase/types';

const REACTIVATIONS_KEY = 'creator_shield_reactivations';

const initialRequests: ReactivationRequest[] = [
    {
        creatorId: "user_creator_wlallah",
        displayName: "Online Wlallah",
        email: "guddumis003@gmail.com",
        avatar: "https://placehold.co/128x128.png",
        requestDate: new Date('2024-06-12').toISOString(),
    },
    {
        creatorId: "user_creator_xyz",
        displayName: "Deleted User",
        email: "deleted@example.com",
        avatar: "https://placehold.co/128x128.png",
        requestDate: new Date('2024-05-28').toISOString(),
    }
];

function getReactivationsFromStorage(): ReactivationRequest[] {
  if (typeof window === 'undefined') return initialRequests;
  
  const stored = localStorage.getItem(REACTIVATIONS_KEY);
  if (!stored) {
    localStorage.setItem(REACTIVATIONS_KEY, JSON.stringify(initialRequests));
    return initialRequests;
  }
  return JSON.parse(stored);
}

function saveReactivationsToStorage(requests: ReactivationRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REACTIVATIONS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event('storage'));
}

export function getAllReactivationRequests(): ReactivationRequest[] {
    return getReactivationsFromStorage();
}

export function approveReactivationRequest(creatorId: string) {
    const current = getReactivationsFromStorage();
    saveReactivationsToStorage(current.filter(r => r.creatorId !== creatorId));
}

export function denyReactivationRequest(creatorId: string) {
    const current = getReactivationsFromStorage();
    saveReactivationsToStorage(current.filter(r => r.creatorId !== creatorId));
}
