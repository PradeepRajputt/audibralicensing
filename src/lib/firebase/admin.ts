
import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        adminDb = admin.firestore();
        adminAuth = admin.auth();
        console.log("Firebase Admin SDK initialized successfully.");
    } else {
        console.warn("Firebase admin credentials are not fully set in .env. Server-side Firebase features will be unavailable. Please check your environment variables.");
    }
  } else {
    // If already initialized, get the instances
    adminDb = admin.firestore();
    adminAuth = admin.auth();
  }
} catch (error) {
    console.error('Firebase admin initialization error:', error);
}

export { adminDb, adminAuth };
