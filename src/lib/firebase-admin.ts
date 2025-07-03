
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
        console.warn("Firebase Admin SDK not initialized. Required environment variables are not set.");
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export { admin };
