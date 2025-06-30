
import * as admin from 'firebase-admin';

let app: admin.app.App | undefined;

function initializeAdminApp() {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    console.warn("Firebase Admin credentials not fully set in .env. Firebase Admin features will be unavailable.");
    return undefined;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
        return admin.app();
    }
    console.error('Firebase admin initialization error:', error);
    // Don't throw, just return undefined so the app can proceed without it
    return undefined;
  }
}

/**
 * Gets the initialized Firebase Admin app instance on-demand.
 * Returns undefined if configuration is missing.
 */
function getAdminApp(): admin.app.App | undefined {
  if (!app) {
    app = initializeAdminApp();
  }
  return app;
}


/**
 * Gets the initialized Firestore database and Auth instances.
 * Returns null for db/auth if the admin app is not configured.
 */
export function getFirebaseAdmin() {
    const adminApp = getAdminApp();
    if (!adminApp) {
        return { adminDb: null, adminAuth: null };
    }
    return {
        adminDb: adminApp.firestore(),
        adminAuth: adminApp.auth()
    }
};
