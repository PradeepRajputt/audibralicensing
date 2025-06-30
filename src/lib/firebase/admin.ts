
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// Explicitly load environment variables from the .env file at the root.
// This is crucial for server-side code in environments where it's not automatic.
config();

// This function ensures the Firebase Admin app is initialized only once (singleton pattern).
function getAdminApp(): admin.app.App {
  // If the app is already initialized, return it.
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  // This check is the most important part.
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    console.error("Firebase Admin credentials are not set in the environment. Please ensure .env file is populated and accessible by the server.");
    // This specific error message will be caught and displayed to the user.
    throw new Error("Registration failed. Please check server configuration.");
  }

  try {
    // Initialize the app with the credentials.
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    // This handles cases where hot-reloading might try to re-initialize the app.
    if (error instanceof Error && error.message.includes('already exists')) {
        return admin.app();
    }
    console.error('Firebase admin initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

/**
 * Gets the initialized Firestore database and Auth instances.
 * The initialization is handled on-demand.
 */
export function getFirebaseAdmin() {
    const app = getAdminApp();
    return {
        adminDb: app.firestore(),
        adminAuth: app.auth()
    }
};
