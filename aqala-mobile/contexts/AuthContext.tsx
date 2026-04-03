import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signUpWithEmail, signInWithEmail, signInWithGoogleCredential, signInWithAppleCredential, signOut, sendPasswordResetEmailToUser, resetPasswordWithCode } from "@/lib/firebase/auth";
import {
  createOrUpdateUserProfile,
  getPartnerDetails,
  getUserProfile,
  updatePostLoginOnboardingProfile,
  updateUserProfileFields,
  type ArabicFluency,
  type PrimaryHelpFocus,
  type PrimaryListenContext,
} from "@/lib/firebase/users";
import { registerAndSyncExpoPushToken, removeExpoPushTokenForThisDevice } from "@/lib/notifications/pushRegistration";
import { AuthContextType, User, PartnerInfo, mapFirebaseUser } from "@/types/auth";
import { Platform } from "react-native";
import Constants from "expo-constants";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to determine auth provider from Firebase user
const getAuthProvider = (firebaseUser: FirebaseUser | null): string | null => {
  if (!firebaseUser) return null;
  const providerId = firebaseUser.providerData[0]?.providerId;
  if (providerId === "google.com") return "google";
  if (providerId === "apple.com") return "apple";
  if (providerId === "password") return "email";
  return providerId || null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [partnerLoading, setPartnerLoading] = useState<boolean>(false);

  // Fetch partner info for a user
  const fetchPartnerInfo = useCallback(async (uid: string) => {
    setPartnerLoading(true);
    try {
      const details = await getPartnerDetails(uid);
      setPartnerInfo(details);
    } catch (err) {
      console.error("Failed to fetch partner info:", err);
      setPartnerInfo({ isPartner: false, mosqueName: null, mosqueId: null });
    } finally {
      setPartnerLoading(false);
    }
  }, []);

  // Manual refresh for partner info
  const refreshPartnerInfo = useCallback(async () => {
    if (user?.uid) {
      await fetchPartnerInfo(user.uid);
    }
  }, [user?.uid, fetchPartnerInfo]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        setError(null);

        if (!firebaseUser) {
          setUser(null);
          setPartnerInfo(null);
          setLoading(false);
          return;
        }

        try {
          await createOrUpdateUserProfile(firebaseUser.uid, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            provider: getAuthProvider(firebaseUser),
          });

          const profile = await getUserProfile(firebaseUser.uid);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: profile?.displayName || firebaseUser.displayName,
            photoURL: profile?.photoURL || firebaseUser.photoURL,
            username: profile?.username || null,
            admin: profile?.admin || false,
            postLoginOnboardingComplete:
              profile?.postLoginOnboardingComplete ?? false,
            arabicFluency: profile?.arabicFluency ?? null,
            primaryHelpFocus: profile?.primaryHelpFocus ?? null,
            primaryListenContext: profile?.primaryListenContext ?? null,
          });

          await fetchPartnerInfo(firebaseUser.uid);
        } catch (err) {
          console.error("Failed to save user profile:", err);
          const mappedUser = mapFirebaseUser(firebaseUser, null, false);
          setUser(mappedUser);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [fetchPartnerInfo]);

  useEffect(() => {
    if (!user?.uid) return;
    void registerAndSyncExpoPushToken(user.uid).catch((err) => {
      console.warn("Push token registration failed:", err);
    });
  }, [user?.uid]);

  // Store pending username during signup flow
  const pendingUsernameRef = React.useRef<string | null>(null);

  const signUp = async (email: string, password: string, username: string): Promise<void> => {
    try {
      setError(null);
      pendingUsernameRef.current = username;
      const firebaseUser = await signUpWithEmail(email, password);

      if (firebaseUser) {
        await createOrUpdateUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          displayName: username,
          photoURL: null,
          username: username.toLowerCase(),
          provider: "email",
        });
      }
      pendingUsernameRef.current = null;
    } catch (err: any) {
      pendingUsernameRef.current = null;
      const errorMessage = err.message || "Failed to create account";
      setError(errorMessage);
      throw err;
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await signInWithEmail(email, password);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in";
      setError(errorMessage);
      throw err;
    }
  };

  const handleSignInWithGoogle = async (): Promise<void> => {
    const expoGoMessage =
      "Google Sign-In is not available in Expo Go. Use a custom dev build (npx expo run:ios) or sign in with email.";

    if (Constants.appOwnership === "expo") {
      setError(expoGoMessage);
      throw new Error(expoGoMessage);
    }

    try {
      setError(null);
      let GoogleSignin: any;
      try {
        GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
      } catch {
        setError(expoGoMessage);
        throw new Error(expoGoMessage);
      }

      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });

      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult?.data?.idToken;

      if (!idToken) {
        throw new Error("No ID token from Google Sign-In");
      }

      await signInWithGoogleCredential(idToken);
    } catch (err: any) {
      const msg = err?.message ?? "";
      const isNativeModuleMissing =
        msg.includes("RNGoogleSignin") || msg.includes("could not be found");
      const errorMessage = isNativeModuleMissing ? expoGoMessage : (err.message || "Failed to sign in with Google");
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleSignInWithApple = async (): Promise<void> => {
    try {
      setError(null);

      if (Platform.OS !== "ios") {
        throw new Error("Apple Sign-In is only available on iOS");
      }

      // Use require() instead of import() to avoid Expo's async-require pre-loading
      let AppleAuthentication: any;
      let Crypto: any;
      try {
        AppleAuthentication = require("expo-apple-authentication");
        Crypto = require("expo-crypto");
      } catch (e) {
        console.error("Apple Sign-In native module unavailable:", e);
        throw new Error(
          "Apple Sign-In is currently unavailable. Please try again later or sign in with email."
        );
      }

      // Generate nonce
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        throw new Error("No identity token from Apple Sign-In");
      }

      await signInWithAppleCredential(credential.identityToken, nonce);
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        // User cancelled, don't throw
        return;
      }
      const errorMessage = err.message || "Failed to sign in with Apple";
      setError(errorMessage);
      throw err;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      setError(null);
      const uid = auth.currentUser?.uid;
      if (uid) {
        await removeExpoPushTokenForThisDevice(uid).catch((err) => {
          console.warn("Could not remove push token on sign-out:", err);
        });
      }
      await signOut();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign out";
      setError(errorMessage);
      throw err;
    }
  };

  const handleSendPasswordReset = async (email: string): Promise<void> => {
    try {
      setError(null);
      await sendPasswordResetEmailToUser(email);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send password reset email";
      setError(errorMessage);
      throw err;
    }
  };

  const handleConfirmPasswordReset = async (oobCode: string, newPassword: string): Promise<void> => {
    try {
      setError(null);
      await resetPasswordWithCode(oobCode, newPassword);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reset password";
      setError(errorMessage);
      throw err;
    }
  };

  const updateUserProfile = async (data: {
    username?: string;
    photoURL?: string;
    bio?: string;
    privateHistory?: boolean;
    privateFollowers?: boolean;
  }): Promise<void> => {
    if (!user?.uid) throw new Error("No user logged in");

    try {
      setError(null);
      await updateUserProfileFields(user.uid, data);

      setUser((prev) =>
        prev
          ? {
              ...prev,
              username: data.username !== undefined ? data.username : prev.username,
              photoURL: data.photoURL !== undefined ? data.photoURL : prev.photoURL,
            }
          : null
      );
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update profile";
      setError(errorMessage);
      throw err;
    }
  };

  const savePostLoginQuestionnaire = async (data: {
    arabicFluency: ArabicFluency;
    primaryHelpFocus: PrimaryHelpFocus;
    primaryListenContext: PrimaryListenContext;
  }): Promise<void> => {
    if (!user?.uid) throw new Error("No user logged in");
    try {
      setError(null);
      await updatePostLoginOnboardingProfile(user.uid, {
        ...data,
        postLoginOnboardingComplete: true,
      });
      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...data,
              postLoginOnboardingComplete: true,
            }
          : null
      );
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save preferences";
      setError(errorMessage);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    partnerInfo,
    partnerLoading,
    signUp,
    signIn,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithApple: handleSignInWithApple,
    signOut: handleSignOut,
    sendPasswordReset: handleSendPasswordReset,
    confirmPasswordReset: handleConfirmPasswordReset,
    refreshPartnerInfo,
    updateUserProfile,
    savePostLoginQuestionnaire,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
