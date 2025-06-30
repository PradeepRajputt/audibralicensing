
'use client';

export type ReactivationRequest = {
  creatorId: string;
  displayName: string;
  email: string;
  avatar: string;
  requestDate: string;
};

const REQUESTS_KEY = 'creator_shield_reactivations';

function getRequestsFromStorage(): ReactivationRequest[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(REQUESTS_KEY);
    if (!stored) {
        const initial: ReactivationRequest[] = [
           {
                creatorId: "user_creator_xyz",
                displayName: "Deleted User",
                email: "deleted@example.com",
                avatar: "https://placehold.co/128x128.png",
                requestDate: "2024-05-28",
           }
        ];
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(stored);
}

function saveRequestsToStorage(requests: ReactivationRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event('storage'));
}

export function getAllReactivationRequests(): ReactivationRequest[] {
    return getRequestsFromStorage();
}

export function addReactivationRequest(request: ReactivationRequest) {
    const requests = getRequestsFromStorage();
    if (!requests.some(r => r.creatorId === request.creatorId)) {
        saveRequestsToStorage([...requests, request]);
    }
}

export function approveReactivationRequest(creatorId: string) {
    const requests = getRequestsFromStorage();
    const updatedRequests = requests.filter(r => r.creatorId !== creatorId);
    saveRequestsToStorage(updatedRequests);
}

export function denyReactivationRequest(creatorId: string) {
    const requests = getRequestsFromStorage();
    const updatedRequests = requests.filter(r => r.creatorId !== creatorId);
    saveRequestsToStorage(updatedRequests);
}
