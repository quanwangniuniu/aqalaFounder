import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  User as FirebaseUser,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
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

/**
 * Sign in with Google credential (from @react-native-google-signin)
 * The idToken is obtained from GoogleSignin.signIn() on the native side
 */
export const signInWithGoogleCredential = async (idToken: string): Promise<FirebaseUser> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
};

/**
 * Sign in with Apple credential (from expo-apple-authentication)
 * The identityToken and nonce are obtained from AppleAuthentication.signInAsync()
 */
export const signInWithAppleCredential = async (
  identityToken: string,
  nonce: string
): Promise<FirebaseUser> => {
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: identityToken,
    rawNonce: nonce,
  });
  const result = await signInWithCredential(auth, credential);
  return result.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const sendPasswordResetEmailToUser = async (email: string): Promise<void> => {
  const appUrl = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";
  const actionCodeSettings = {
    url: `${appUrl}/auth/reset-password`,
    handleCodeInApp: true,
  };
  await sendPasswordResetEmail(auth, email, actionCodeSettings);
};

export const resetPasswordWithCode = async (oobCode: string, newPassword: string): Promise<void> => {
  await confirmPasswordReset(auth, oobCode, newPassword);
};
