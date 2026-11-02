// On a phone, localhost is the phone itself: set EXPO_PUBLIC_BACKEND_URL to your
// computer's LAN address (http://192.168.x.x:4000) or the deployed backend.
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

/** Invite links open the backend's /join page, which opens the app or the web version. */
export const inviteLink = (code: string) => `${BACKEND_URL}/join/${code}`;
