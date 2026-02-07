import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// POST /api/broadcast/stop
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
        { error: "You are not authorized to stop this broadcast" },
        { status: 403 }
      );
    }

    // Verify the roomId matches the partner's mosque
    if (userData.partnerMosqueId !== roomId) {
      return NextResponse.json(
        { error: "You can only stop broadcasts in your own mosque room" },
        { status: 403 }
      );
    }

    // Update the room to stop broadcast
    const roomRef = db.collection("mosques").doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    await roomRef.update({
      activeTranslatorId: null,
      broadcastStartedAt: null,
    });

    // Update member role back to listener
    const memberRef = db.collection("mosques").doc(roomId).collection("members").doc(userId);
    await memberRef.set({
      role: "listener",
    }, { merge: true });

    return NextResponse.json({ 
      success: true, 
      message: "Broadcast stopped",
      roomId 
    });

  } catch (e: any) {
    console.error("Error stopping broadcast:", e);
    return NextResponse.json(
      { error: "Failed to stop broadcast", detail: e?.message },
      { status: 500 }
    );
  }
}
