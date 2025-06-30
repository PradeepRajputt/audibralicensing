
import * as admin from 'firebase-admin';

// This is a more robust way to handle the singleton pattern in serverless environments.
function getAdminApp(): admin.app.App {
  // If the app is already initialized, return it.
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error("Firebase Admin credentials are not set in the environment. Please check your .env file and server configuration.");
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    return app;
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // Re-throw a more generic error to avoid leaking implementation details
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

/**
 * Gets the initialized Firestore database instance.
 * Throws an error if initialization fails.
 */
export function getAdminDb() {
  return getAdminApp().firestore();
}

/**
 * Gets the initialized Firebase Auth instance.
 * Throws an error if initialization fails.
 */
export function getAdminAuth() {
  return getAdminApp().auth();
}
