import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  AuthError,
} from "firebase/auth";
import { auth } from "./config";

export const signUpWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    const authError = error as AuthError;
    // Handle popup blocked error with user-friendly message
    if (authError.code === "auth/popup-blocked") {
      throw new Error(
        "Popup was blocked by your browser. Please allow popups for this site and try again, or use email/password sign-in."
      );
    }
    // Handle popup closed error
    if (authError.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled. Please try again if you want to continue.");
    }
    // Re-throw other errors with their original messages
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

