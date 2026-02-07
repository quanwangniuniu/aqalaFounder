import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const runtime = "nodejs";

// POST /api/livekit/token
// Body: { roomName: string, participantName: string, isPublisher?: boolean }
export async function POST(req: Request) {
  try {
    const { roomName, participantName, isPublisher } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "Missing roomName or participantName" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    // Create access token
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: isPublisher === true,
      canSubscribe: true,
      canPublishData: isPublisher === true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    });
  } catch (e: any) {
    console.error("Error generating LiveKit token:", e);
    return NextResponse.json(
      { error: "Failed to generate token", detail: e?.message },
      { status: 500 }
    );
  }
}
