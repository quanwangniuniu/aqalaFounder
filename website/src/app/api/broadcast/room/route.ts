import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// GET /api/broadcast/room
// Headers: Authorization: Bearer <firebase_id_token>
// Returns the partner's room (creates if doesn't exist)
export async function GET(req: Request) {
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
    const db = getAdminFirestore();

    // Check if user is a partner
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.partner) {
      return NextResponse.json(
        { error: "You are not authorized as a partner" },
        { status: 403 }
      );
    }

    const mosqueId = userData.partnerMosqueId;
    const mosqueName = userData.partnerMosqueName || "Partner Mosque";

    if (!mosqueId) {
      return NextResponse.json(
        { error: "Partner mosque ID not configured" },
        { status: 400 }
      );
    }

    // Get or create the room
    const roomRef = db.collection("mosques").doc(mosqueId);
    const roomDoc = await roomRef.get();

    if (roomDoc.exists) {
      const data = roomDoc.data()!;
      return NextResponse.json({
        room: {
          id: roomDoc.id,
          name: data.name,
          ownerId: data.ownerId,
          activeTranslatorId: data.activeTranslatorId || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
          memberCount: data.memberCount ?? 0,
          isActive: data.isActive ?? true,
          isBroadcast: data.isBroadcast ?? true,
          partnerId: data.partnerId || userId,
          partnerName: data.partnerName || mosqueName,
          broadcastStartedAt: data.broadcastStartedAt?.toDate?.()?.toISOString() ?? null,
        }
      });
    }

    // Create new partner room
    await roomRef.set({
      name: mosqueName,
      ownerId: userId,
      activeTranslatorId: null,
      createdAt: FieldValue.serverTimestamp(),
      memberCount: 0,
      isActive: true,
      isBroadcast: true,
      partnerId: userId,
      partnerName: mosqueName,
      broadcastStartedAt: null,
    });

    return NextResponse.json({
      room: {
        id: mosqueId,
        name: mosqueName,
        ownerId: userId,
        activeTranslatorId: null,
        createdAt: new Date().toISOString(),
        memberCount: 0,
        isActive: true,
        isBroadcast: true,
        partnerId: userId,
        partnerName: mosqueName,
        broadcastStartedAt: null,
      }
    });

  } catch (e: any) {
    console.error("Error getting/creating partner room:", e);
    return NextResponse.json(
      { error: "Failed to get room", detail: e?.message },
      { status: 500 }
    );
  }
}
