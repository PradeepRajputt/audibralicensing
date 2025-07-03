
import admin from 'firebase-admin';

// This function robustly initializes the Firebase Admin SDK.
// It checks if the app is already initialized and if the required environment variable exists.
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  // Check if the service account key is available in environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
       console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      // This will prevent the build from crashing if the JSON is malformed.
    }
  } else {
    // This warning is useful for developers to know they need to set up their .env file.
    // It will not crash the build.
    console.warn("Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT_KEY env var not set.");
  }
}

// Call the initialization function.
initializeFirebaseAdmin();


export { admin };
