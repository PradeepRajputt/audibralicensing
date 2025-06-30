
import * as admin from 'firebase-admin';

// This file is designed to be imported only on the server.

interface FirebaseAdmin {
  adminDb: admin.firestore.Firestore;
  adminAuth: admin.auth.Auth;
}

// We declare a global variable to hold the cached admin instance.
declare global {
  // eslint-disable-next-line no-var
  var __firebaseAdmin: FirebaseAdmin | undefined;
}

function initializeAdmin(): FirebaseAdmin {
  // If the instance already exists, return it to avoid re-initialization.
  if (global.__firebaseAdmin) {
    return global.__firebaseAdmin;
  }
  
  // Sanitize the private key, which often comes with escaped newlines from .env files.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Check for the presence of all required environment variables.
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('Server Configuration Error: FIREBASE_PROJECT_ID is missing from environment variables.');
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Server Configuration Error: FIREBASE_CLIENT_EMAIL is missing from environment variables.');
  }
  if (!privateKey) {
    throw new Error('Server Configuration Error: FIREBASE_PRIVATE_KEY is missing from environment variables.');
  }
  
  try {
    // Initialize the Firebase Admin App.
    // This checks if an app is already initialized to prevent errors in hot-reload environments.
    const app = admin.apps.length > 0
      ? admin.apps[0]!
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });

    const adminServices: FirebaseAdmin = {
      adminDb: admin.firestore(app),
      adminAuth: admin.auth(app),
    };
    
    // Cache the initialized services in the global scope for efficiency.
    global.__firebaseAdmin = adminServices;
    
    console.log("Firebase Admin SDK initialized successfully.");
    return adminServices;
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Throw a more user-friendly error if initialization fails.
    throw new Error('Failed to initialize Firebase services on the server. Please check server logs for credential errors.');
  }
}

/**
 * A singleton getter for Firebase Admin services.
 * It will initialize the app on the first call and reuse the instance on subsequent calls.
 */
export const getFirebaseAdmin = (): FirebaseAdmin => {
  return initializeAdmin();
};
