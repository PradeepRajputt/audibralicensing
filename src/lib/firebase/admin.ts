
import * as admin from 'firebase-admin';

// This prevents initialization on every hot-reload in development
if (!admin.apps.length) {
  try {
    // Ensure that the private key is properly formatted
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        // We warn here instead of throwing, because the app might be in a state
        // where server-side Firebase is not required (e.g., client-side only pages).
        // The functions that *do* require it will throw an error if not configured.
        console.warn("Firebase admin credentials are not set. Server-side Firebase features will be unavailable.");
    }
      
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error. Make sure your FIREBASE_PRIVATE_KEY is correctly formatted in your .env file.', error);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
