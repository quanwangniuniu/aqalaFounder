"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signOut } from "@/lib/firebase/auth";
import { AuthContextType, User, mapFirebaseUser } from "@/types/auth";

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        setUser(mapFirebaseUser(firebaseUser));
        setLoading(false);
        // Clear error when auth state changes (including sign out)
        setError(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await signUpWithEmail(email, password);
    } catch (err: any) {
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

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

