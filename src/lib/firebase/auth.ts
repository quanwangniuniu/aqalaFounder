import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
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

export const signInWithApple = async (): Promise<FirebaseUser> => {
  const provider = new OAuthProvider("apple.com");
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

export const sendPasswordResetEmailToUser = async (email: string): Promise<void> => {
  const actionCodeSettings = {
    url: typeof window !== "undefined" 
      ? `${window.location.origin}/auth/reset-password`
      : process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
        : "/auth/reset-password",
    handleCodeInApp: true,
  };
  await sendPasswordResetEmail(auth, email, actionCodeSettings);
};

export const resetPasswordWithCode = async (oobCode: string, newPassword: string): Promise<void> => {
  await confirmPasswordReset(auth, oobCode, newPassword);
};

