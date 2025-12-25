"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRooms } from "@/contexts/RoomsContext";
import { subscribeRoomMembers, RoomMember } from "@/lib/firebase/rooms";
import ClientApp from "@/app/client-app";
import TranslationHistory from "@/components/TranslationHistory";
import LiveTranslationView from "@/components/LiveTranslationView";
import { getUserDisplayName } from "@/utils/userDisplay";

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { rooms, joinRoom, claimLeadReciter, validateAndCleanTranslator, releaseTranslator } = useRooms();

  const room = useMemo(() => rooms.find((r) => r.id === roomId), [rooms, roomId]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [role, setRole] = useState<"translator" | "listener" | null>(null);
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState<RoomMember[]>([]);

  // Check if activeTranslatorId is valid (exists in members)
  const validTranslatorId = useMemo(() => {
    if (!room?.activeTranslatorId) return null;
    const translatorMember = members.find((m) => m.userId === room.activeTranslatorId);
    return translatorMember ? room.activeTranslatorId : null;
  }, [room?.activeTranslatorId, members]);

  const isTranslator = validTranslatorId === user?.uid || role === "translator";
  const canTranslate = !!user && isTranslator;

  useEffect(() => {
    setMessage(null);
    setJoined(false);
    setRole(null);
    setMembers([]);
  }, [roomId]);

  // Subscribe to members and validate translator (only when user is signed in)
  useEffect(() => {
    if (!roomId || !user) {
      setMembers([]);
      return;
    }
    const unsubscribe = subscribeRoomMembers(
      roomId,
      (incoming) => {
        setMembers(incoming);
        // Validate translator when members change
        validateAndCleanTranslator(roomId).catch((err) => {
          console.error("Error validating translator:", err);
        });
      },
      (err) => {
        // Ignore permission errors when user signs out (expected behavior)
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          setMembers([]);
          return;
        }
        console.error("Error loading members:", err);
      }
    );
    return () => unsubscribe();
  }, [roomId, user, validateAndCleanTranslator]);

  // Validate translator when room data changes
  useEffect(() => {
    if (roomId && room?.activeTranslatorId) {
      validateAndCleanTranslator(roomId).catch((err) => {
        console.error("Error validating translator:", err);
      });
    }
  }, [roomId, room?.activeTranslatorId, validateAndCleanTranslator]);

  // Auto-join on load: always join as listener (no automatic translator assignment)
  const joinInProgressRef = useRef(false);
  useEffect(() => {
    let isMounted = true;
    
    const join = async () => {
      if (!user || !room || joined || joinInProgressRef.current) {
        console.log(`[JOIN MOSQUE UI] Skipping join - user: ${user?.uid}, room: ${room?.id}, joined: ${joined}, joinInProgress: ${joinInProgressRef.current}`);
        return;
      }
      console.log(`[JOIN MOSQUE UI] Initiating join - roomId: ${roomId}, userId: ${user.uid}`);
      joinInProgressRef.current = true;
      setBusy(true);
      try {
        await joinRoom(roomId, false); // Always join as listener
        console.log(`[JOIN MOSQUE UI] Join successful - roomId: ${roomId}, userId: ${user.uid}`);
        if (isMounted) {
          setRole("listener");
          setMessage("You joined as listener. Click record to become lead reciter.");
          setJoined(true);
        }
      } catch (err: any) {
        console.error(`[JOIN MOSQUE UI] Join error - roomId: ${roomId}, userId: ${user.uid}, errorCode: ${err?.code}, error:`, err);
        // Ignore "already-exists" errors - user is already a member
        if (err?.code === 'already-exists' || err?.code === 409 || err?.message?.includes('already-exists')) {
          console.log(`[JOIN MOSQUE UI] Already exists (treated as success) - roomId: ${roomId}, userId: ${user.uid}`);
          if (isMounted) {
            setRole("listener");
            setJoined(true);
          }
        } else if (err?.code === 'failed-precondition' || err?.code === 9 || err?.code === 'ABORTED' || err?.message?.includes('concurrent modification')) {
          // Transaction conflict - check if user is actually a member now
          console.log(`[JOIN MOSQUE UI] Transaction conflict - roomId: ${roomId}, userId: ${user.uid}, checking membership status`);
          // The backend already checked, so if we get here, the join likely failed
          if (isMounted) {
            setMessage("Failed to join due to concurrent changes. Please refresh and try again.");
          }
        } else if (isMounted) {
          setMessage(err?.message || "Failed to join this mosque.");
        }
      } finally {
        if (isMounted) {
          setBusy(false);
        }
        joinInProgressRef.current = false;
      }
    };
    
    void join();
    
    return () => {
      isMounted = false;
      joinInProgressRef.current = false;
    };
  }, [user, room, roomId, joinRoom, joined]);

  if (!room) {
    return (
      <div className="px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Room</h1>
          <Link href="/rooms" className="text-[#7D00D4] font-medium hover:underline">
            Back to mosques
          </Link>
        </div>
        <p className="text-sm text-zinc-600">Room not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{room.name}</h1>
              <p className="text-sm text-zinc-600">
                Members: {room.memberCount} • Lead reciter: {validTranslatorId ? getUserDisplayName(null, validTranslatorId) : "None"}
              </p>
            </div>
            <Link href="/rooms" className="text-[#7D00D4] font-medium hover:underline">
              Back to mosques
            </Link>
          </div>

          {message && (
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
              {message}
            </div>
          )}

        </div>

        {/* Main content area - stacked rows */}
        <div className="space-y-6">
          {/* Translation card - first row */}
          {canTranslate ? (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
                <p className="font-medium">Lead reciter view</p>
                <p className="text-sm text-zinc-600">You are the lead reciter. Click record to start translating.</p>
              </div>
              <div className="min-h-[500px]">
                <ClientApp 
                  mosqueId={roomId} 
                  translatorId={user?.uid} 
                  onClaimReciter={async () => {
                    await claimLeadReciter(roomId);
                    setRole("translator");
                  }}
                  onReleaseReciter={async () => {
                    await releaseTranslator(roomId);
                    setRole("listener");
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              {validTranslatorId ? (
                <>
                  <LiveTranslationView mosqueId={roomId} activeTranslatorId={validTranslatorId} />
                  <div className="border-t border-zinc-200 p-4 bg-zinc-50">
                    <p className="text-sm text-zinc-600 mb-2">
                      Listening to {getUserDisplayName(null, validTranslatorId)}. Click record to become the lead reciter.
                    </p>
                    {/* Only show record button, not full ClientApp UI for listeners */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={async () => {
                          try {
                            await claimLeadReciter(roomId);
                            setRole("translator");
                          } catch (err: any) {
                            setMessage(err?.message || "Failed to become lead reciter. Please try again.");
                          }
                        }}
                        aria-label="Start recording to become lead reciter"
                        className="relative h-16 w-16 rounded-full flex items-center justify-center transition-colors outline-none focus:outline-none ring-0 focus:ring-0 no-tap-highlight bg-[#0A84FF] hover:bg-[#0066CC]"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
                            fill="white"
                          />
                          <path
                            d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H10a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
                    <p className="font-medium">Listener view</p>
                    <p className="text-sm text-zinc-600">No lead reciter yet. Click the record button to become the lead reciter.</p>
                  </div>
                  {/* Only show record button, not full ClientApp UI when no translator */}
                  <div className="flex-1 flex items-center justify-center p-8">
                    <button
                      onClick={async () => {
                        try {
                          await claimLeadReciter(roomId);
                          setRole("translator");
                        } catch (err: any) {
                          setMessage(err?.message || "Failed to become lead reciter. Please try again.");
                        }
                      }}
                      aria-label="Start recording to become lead reciter"
                      className="relative h-16 w-16 rounded-full flex items-center justify-center transition-colors outline-none focus:outline-none ring-0 focus:ring-0 no-tap-highlight bg-[#0A84FF] hover:bg-[#0066CC]"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
                          fill="white"
                        />
                        <path
                          d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H10a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Translation History - second row */}
          <div>
            <TranslationHistory mosqueId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
}

