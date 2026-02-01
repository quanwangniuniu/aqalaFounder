import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

if (typeof window === "undefined") {
  // Only initialize on server side
  if (getApps().length === 0) {
    // Try to initialize with service account credentials from env vars
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      // Use service account credentials from environment variables
      try {
        // Remove quotes if present and replace escaped newlines
        const cleanPrivateKey = privateKey.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, "\n");
        
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: cleanPrivateKey,
          }),
          projectId,
        });
      } catch (error: any) {
        console.error("Firebase Admin initialization error:", error.message);
        throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
      }
    } else {
      // Fallback: Initialize with just project ID (requires GOOGLE_APPLICATION_CREDENTIALS or gcloud auth)
      // This is useful for local development with Firebase CLI or Google Cloud environments
      if (!projectId) {
        throw new Error(
          "Firebase Admin credentials not found. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables, or use GOOGLE_APPLICATION_CREDENTIALS."
        );
      }
      adminApp = initializeApp({
        projectId,
      });
    }
  } else {
    adminApp = getApps()[0];
  }
  adminDb = getFirestore(adminApp);
}

export { adminDb };
