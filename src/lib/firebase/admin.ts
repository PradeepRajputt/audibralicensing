
import * as admin from 'firebase-admin';

// This function will be memoized by Node's module caching system,
// ensuring it only runs once per server instance.
function getAdminInstances() {
  if (admin.apps.length > 0) {
    return {
      adminDb: admin.firestore(),
      adminAuth: admin.auth()
    };
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
      return {
        adminDb: admin.firestore(),
        adminAuth: admin.auth()
      };
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      // Fall through to return nulls if initialization fails
    }
  }

  // If we reach here, it means credentials were not fully provided or initialization failed.
  console.warn("Firebase admin credentials are not fully set in .env. Server-side Firebase features will be unavailable.");
  return { adminDb: null, adminAuth: null };
}

// Export the instances directly. They will be either the initialized instances or null.
export const { adminDb, adminAuth } = getAdminInstances();
