
import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

/**
 * Initializes the Firebase Admin SDK if not already initialized.
 * This function is designed to be called on-demand to ensure
 * environment variables are loaded.
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    if (!adminDb) adminDb = admin.firestore();
    if (!adminAuth) adminAuth = admin.auth();
    return;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully.");
      adminDb = admin.firestore();
      adminAuth = admin.auth();
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      // Set to null on failure
      adminDb = null;
      adminAuth = null;
    }
  } else {
    console.warn("Firebase admin credentials are not fully set in .env. Server-side Firebase features will be unavailable.");
  }
}

/**
 * Lazily initializes and returns the Firebase Admin database and auth instances.
 * @returns An object containing the Firestore DB and Auth instances, or null if not initialized.
 */
export function getFirebaseAdmin() {
    if (!adminDb || !adminAuth) {
        initializeFirebaseAdmin();
    }
    return { adminDb, adminAuth };
}
