import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// POST /api/broadcast/start
// Headers: Authorization: Bearer <firebase_id_token>
// Body: { roomId: string }
export async function POST(req: Request) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Verify the Firebase ID token
    const auth = getAdminAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json(
        { error: "Missing roomId" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Check if user is a partner
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.partner) {
      return NextResponse.json(
        { error: "You are not authorized to broadcast" },
        { status: 403 }
      );
    }

    // Verify the roomId matches the partner's mosque
    if (userData.partnerMosqueId !== roomId) {
      return NextResponse.json(
        { error: "You can only broadcast in your own mosque room" },
        { status: 403 }
      );
    }

    // Get or create the room
    const roomRef = db.collection("mosques").doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      // Create the room if it doesn't exist
      await roomRef.set({
        name: userData.partnerMosqueName || "Partner Mosque",
        ownerId: userId,
        activeTranslatorId: userId,
        createdAt: FieldValue.serverTimestamp(),
        memberCount: 1,
        isActive: true,
        isBroadcast: true,
        partnerId: userId,
        partnerName: userData.partnerMosqueName || "Partner Mosque",
        broadcastStartedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // Update existing room
      await roomRef.update({
        activeTranslatorId: userId,
        broadcastStartedAt: FieldValue.serverTimestamp(),
        isActive: true,
        // Ensure broadcast fields are set
        isBroadcast: true,
        partnerId: userId,
        partnerName: userData.partnerMosqueName || roomDoc.data()?.name,
      });
    }

    // Add/update partner as member with translator role
    const memberRef = db.collection("mosques").doc(roomId).collection("members").doc(userId);
    await memberRef.set({
      userId,
      role: "translator",
      joinedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ 
      success: true, 
      message: "Broadcast started",
      roomId 
    });

  } catch (e: any) {
    console.error("Error starting broadcast:", e);
    return NextResponse.json(
      { error: "Failed to start broadcast", detail: e?.message },
      { status: 500 }
    );
  }
}
