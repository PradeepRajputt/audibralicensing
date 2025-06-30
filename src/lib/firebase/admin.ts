
import * as admin from 'firebase-admin';

// This is a common pattern to avoid re-initializing the Firebase Admin SDK
// on every hot reload in development.

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
  if (global.__firebaseAdmin) {
    return global.__firebaseAdmin;
  }
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('Server Configuration Error: FIREBASE_PROJECT_ID is not set in your environment variables.');
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Server Configuration Error: FIREBASE_CLIENT_EMAIL is not set in your environment variables.');
  }
  if (!privateKey) {
    throw new Error('Server Configuration Error: FIREBASE_PRIVATE_KEY is not set in your environment variables.');
  }
  
  try {
    const app = admin.apps.length > 0 && admin.apps[0]
      ? admin.apps[0]
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
    
    // Cache the initialized services in the global scope
    global.__firebaseAdmin = adminServices;
    
    return adminServices;
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error);
    // Provide a more user-friendly error
    throw new Error('Failed to initialize Firebase services on the server. Please check server logs for details.');
  }
}

/**
 * A singleton getter for Firebase Admin services.
 * It will initialize the app on the first call.
 */
export const getFirebaseAdmin = (): FirebaseAdmin => {
  // This pattern prevents re-initialization on hot-reloads in development.
  if (global.__firebaseAdmin) {
    return global.__firebaseAdmin;
  }
  return initializeAdmin();
};
