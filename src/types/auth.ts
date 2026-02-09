import { User as FirebaseUser } from "firebase/auth";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string | null;
  admin: boolean;
  listenerTitle?: string;
  level?: number;
}

export interface PartnerInfo {
  isPartner: boolean;
  mosqueName: string | null;
  mosqueId: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  partnerInfo: PartnerInfo | null;
  partnerLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
  refreshPartnerInfo: () => Promise<void>;
  updateUserProfile: (data: {
    username?: string;
    photoURL?: string;
    bio?: string;
    privateHistory?: boolean;
    privateFollowers?: boolean;
  }) => Promise<void>;
}

export function mapFirebaseUser(
  firebaseUser: FirebaseUser | null,
  username?: string | null,
  admin?: boolean
): User | null {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    username: username || null,
    admin: admin || false,
  };
}
