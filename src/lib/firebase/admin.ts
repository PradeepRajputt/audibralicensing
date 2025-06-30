
import * as admin from 'firebase-admin';

// This prevents initialization on every hot-reload in development
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    } else {
        console.warn("Firebase admin credentials are not set. Server-side Firebase features will be unavailable.");
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

// Export potentially null instances if initialization failed
const adminDb = admin.apps.length ? admin.firestore() : null;
const adminAuth = admin.apps.length ? admin.auth() : null;

export { adminDb, adminAuth };
