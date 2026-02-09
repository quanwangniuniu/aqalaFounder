"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithApple, signOut, sendPasswordResetEmailToUser, resetPasswordWithCode } from "@/lib/firebase/auth";
import { createOrUpdateUserProfile, getPartnerDetails, getUserProfile, updateUserProfileFields } from "@/lib/firebase/users";
import { AuthContextType, User, PartnerInfo, mapFirebaseUser } from "@/types/auth";

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
        // Clear error when auth state changes (including sign out)
        setError(null);

        // Clear partner info on sign out
        if (!firebaseUser) {
          setUser(null);
          setPartnerInfo(null);
          setLoading(false);
          return;
        }

        // Save user profile to Firestore when logged in
          try {
            await createOrUpdateUserProfile(firebaseUser.uid, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              provider: getAuthProvider(firebaseUser),
            });
          
          // Fetch the full profile including username and photoURL from Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          
          // Use Firestore profile data, falling back to Firebase Auth data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: profile?.displayName || firebaseUser.displayName,
            photoURL: profile?.photoURL || firebaseUser.photoURL, // Prefer Firestore photoURL
            username: profile?.username || null,
            admin: profile?.admin || false,
            listenerTitle: profile?.listenerTitle || undefined,
            level: profile?.level ?? undefined,
          });
          
          // Fetch partner info after profile is updated
          await fetchPartnerInfo(firebaseUser.uid);
          } catch (err) {
            console.error("Failed to save user profile:", err);
          // Still set user even if profile save fails
          const mappedUser = mapFirebaseUser(firebaseUser, null, false);
          setUser(mappedUser);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [fetchPartnerInfo]);

  // Store pending username during signup flow
  const pendingUsernameRef = React.useRef<string | null>(null);

  const signUp = async (email: string, password: string, username: string): Promise<void> => {
    try {
      setError(null);
      // Store username to be saved after user is created
      pendingUsernameRef.current = username;
      const firebaseUser = await signUpWithEmail(email, password);
      
      // Save username immediately after signup
      if (firebaseUser) {
        await createOrUpdateUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          displayName: username, // Use username as display name initially
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
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in with Google";
      setError(errorMessage);
      throw err;
    }
  };

  const handleSignInWithApple = async (): Promise<void> => {
    try {
      setError(null);
      await signInWithApple();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in with Apple";
      setError(errorMessage);
      throw err;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      setError(null);
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
      
      // Update local user state (only for fields we track in User)
      setUser(prev => prev ? {
        ...prev,
        username: data.username !== undefined ? data.username : prev.username,
        photoURL: data.photoURL !== undefined ? data.photoURL : prev.photoURL,
      } : null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update profile";
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

