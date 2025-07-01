
import 'dotenv/config'; // Ensures .env variables are loaded at the very start
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

// --- Check for essential environment variables
const requiredEnv = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  const message = `Firebase Admin initialization failed. Missing environment variables: ${missingEnv.join(', ')}. Please check your .env file.`;
  // We throw an error during build/start-up time if essentials are missing
  // to prevent runtime errors later.
  if (process.env.NODE_ENV !== 'development' || process.env.VERCEL) {
     throw new Error(message);
  }
  console.warn(message);
}

// --- Prepare credentials, handling the escaped newline characters
let privateKey: string | undefined = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  try {
    // Attempt to parse JSON directly
    privateKey = JSON.parse(privateKey).privateKey ?? privateKey;
  } catch {
    // If it fails, assume it's the raw key with escaped newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
}

const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey,
};

// --- Singleton pattern for Firebase Admin SDK
// This prevents re-initializing the app on every hot-reload in development.

interface FirebaseAdmin {
  app: App;
  auth: Auth;
  db: Firestore;
}

// Use a global symbol to store the admin instance
const ADMIN_KEY = Symbol.for('firebase-admin-instance');

function getAdminInstance(): FirebaseAdmin | null {
  // If the required env vars aren't present, we can't initialize.
  if (missingEnv.length > 0) {
    return null;
  }
  
  if ((globalThis as any)[ADMIN_KEY]) {
    return (globalThis as any)[ADMIN_KEY];
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    const instance: FirebaseAdmin = {
      app,
      auth: admin.auth(app),
      db: admin.firestore(app),
    };
    
    (globalThis as any)[ADMIN_KEY] = instance;
    console.log("Firebase Admin SDK initialized successfully.");
    return instance;

  } catch (error: any) {
    // Catch initialization errors (e.g., invalid credentials)
    console.error("Firebase Admin SDK initialization error:", error.message);
    return null;
  }
}

export function getFirebaseAdmin() {
  const instance = getAdminInstance();
  return {
    app: instance?.app,
    auth: instance?.auth,
    db: instance?.db
  };
}

