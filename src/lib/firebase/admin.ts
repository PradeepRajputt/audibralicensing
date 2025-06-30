
import * as admin from 'firebase-admin';

// These are initialized as null and will be populated by getFirebaseAdmin
let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be called once and memoizes the result.
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

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
        console.log("Firebase Admin SDK initialized successfully.");
        adminDb = admin.firestore();
        adminAuth = admin.auth();
    } else {
      // This log helps in debugging if env vars are missing on the server.
      console.warn("Firebase admin credentials are not fully set in .env. Server-side Firebase features will be unavailable.");
    }
  } catch (error) {
      console.error('Firebase admin initialization error:', error);
      // We don't want to throw here, but let the null check handle it.
  }
}

/**
 * A getter function to ensure Firebase Admin is initialized before use.
 * This on-demand approach prevents initialization errors during module loading.
 * @returns An object containing the adminDb and adminAuth instances, or nulls if initialization failed.
 */
function getFirebaseAdmin() {
    // If not initialized, do it now.
    if (!admin.apps.length) {
        initializeFirebaseAdmin();
    }
    return { adminDb, adminAuth };
}

export { getFirebaseAdmin };
