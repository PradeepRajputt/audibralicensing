import 'dotenv/config'; 
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

interface FirebaseAdmin {
  app: App;
  auth: Auth;
  db: Firestore;
}

const missingEnv: string[] = [];
if (!process.env.FIREBASE_PROJECT_ID) missingEnv.push('FIREBASE_PROJECT_ID');
if (!process.env.FIREBASE_CLIENT_EMAIL) missingEnv.push('FIREBASE_CLIENT_EMAIL');
if (!process.env.FIREBASE_PRIVATE_KEY) missingEnv.push('FIREBASE_PRIVATE_KEY');

/**
 * Gets the initialized Firebase Admin instance.
 * This is a singleton that initializes the app only once.
 * @returns The initialized Firebase Admin services.
 * @throws An error if initialization fails due to missing environment variables or invalid credentials.
 */
export function getFirebaseAdmin(): FirebaseAdmin {
  if (admin.apps.length > 0 && admin.app()) {
    const app = admin.app();
    return {
      app,
      auth: admin.auth(app),
      db: admin.firestore(app),
    };
  }

  if (missingEnv.length > 0) {
    throw new Error(`Firebase Admin initialization failed. Missing environment variables: ${missingEnv.join(', ')}. Please add them to your .env file.`);
  }

  try {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n');

    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    };
    
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    return {
      app,
      auth: admin.auth(app),
      db: admin.firestore(app),
    };
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    throw new Error(`Firebase Admin initialization failed. Please check your service account credentials. Details: ${error.message}`);
  }
}
