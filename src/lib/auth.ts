
'use server';

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase";
import { createUser, getUserById, updateUser } from "./users-store";
import { getGoogleOAuthToken, getYoutubeChannelId } from './services/youtube-service';

/**
 * Initiates the Google Sign-In process with YouTube scopes.
 * If the user is new, it creates a user record in the database.
 * If they grant YouTube permissions, it stores their channel ID.
 */
export async function signInWithYouTube() {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");


  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in our DB, if not create them
    let dbUser = await getUserById(user.uid);
    if (!dbUser) {
        dbUser = await createUser({
            id: user.uid,
            displayName: user.displayName,
            email: user.email,
            role: user.email === 'admin@creatorshield.com' ? 'admin' : 'creator',
            image: user.photoURL
        });
    }

    // Get OAuth credential to access YouTube API
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      const channelId = await getYoutubeChannelId(credential.accessToken);
      if (channelId) {
        await updateUser(user.uid, { 
          youtubeChannelId: channelId,
          accessToken: credential.accessToken,
        });
      }
    }

    return { success: true, user: dbUser };
  } catch (error: any) {
    console.error("Error during Google Sign-In:", error);
    // Handle specific auth errors if needed
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, message: 'Sign-in cancelled.' };
    }
    return { success: false, message: error.message };
  }
}

/**
 * Signs the user out.
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out: ", error);
    return { success: false, message: (error as Error).message };
  }
}
