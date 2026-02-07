/**
 * One-time migration script to sync isPremium status from subscriptions to user profiles
 * Run with: npx tsx scripts/sync-premium-users.ts
 * 
 * Make sure your .env.local has the Firebase Admin credentials:
 * - FIREBASE_PRIVATE_KEY
 * - FIREBASE_CLIENT_EMAIL  
 * - FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(__dirname, "../.env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.error("❌ Missing Firebase Admin credentials in .env.local");
    console.error("Required: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID");
    process.exit(1);
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    projectId,
  });
}

const db = getFirestore();

async function syncPremiumUsers() {
  console.log("🔄 Starting premium user sync...\n");

  // Get all subscriptions
  const subscriptionsSnapshot = await db.collection("subscriptions").get();
  
  let updated = 0;
  let skipped = 0;

  for (const subDoc of subscriptionsSnapshot.docs) {
    const subData = subDoc.data();
    const userId = subDoc.id;
    const isPremium = subData.plan === "premium" && subData.status === "active";

    // Check if user document exists
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`⚠️  User ${userId} - No user document found, skipping`);
      skipped++;
      continue;
    }

    const userData = userDoc.data();
    const currentIsPremium = userData?.isPremium || false;

    if (currentIsPremium !== isPremium) {
      await userRef.update({ 
        isPremium,
        updatedAt: new Date(),
      });
      console.log(`✅ User ${userId} - Set isPremium: ${isPremium}`);
      updated++;
    } else {
      console.log(`⏭️  User ${userId} - Already synced (isPremium: ${isPremium})`);
      skipped++;
    }
  }

  console.log(`\n✨ Done! Updated: ${updated}, Skipped: ${skipped}`);
}

syncPremiumUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
