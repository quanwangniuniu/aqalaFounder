"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRooms } from "@/contexts/RoomsContext";
import { subscribeRoomMembers, RoomMember } from "@/lib/firebase/rooms";
import ClientApp from "@/app/client-app";
import TranslationHistory from "@/components/TranslationHistory";
import { getUserDisplayName } from "@/utils/userDisplay";

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { rooms, joinRoom, leaveRoom, claimLeadReciter, validateAndCleanTranslator } = useRooms();

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

  // Subscribe to members and validate translator
  useEffect(() => {
    if (!roomId) return;
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
        console.error("Error loading members:", err);
      }
    );
    return () => unsubscribe();
  }, [roomId, validateAndCleanTranslator]);

  // Validate translator when room data changes
  useEffect(() => {
    if (roomId && room?.activeTranslatorId) {
      validateAndCleanTranslator(roomId).catch((err) => {
        console.error("Error validating translator:", err);
      });
    }
  }, [roomId, room?.activeTranslatorId, validateAndCleanTranslator]);

  // Auto-join on load: always join as listener (no automatic translator assignment)
  useEffect(() => {
    let isMounted = true;
    let joinInProgress = false;
    
    const join = async () => {
      if (!user || !room || joined || joinInProgress) return;
      joinInProgress = true;
      setBusy(true);
      try {
        await joinRoom(roomId, false); // Always join as listener
        if (isMounted) {
          setRole("listener");
          setMessage("You joined as listener. Click record to become lead reciter.");
          setJoined(true);
        }
      } catch (err: any) {
        // Ignore "already-exists" errors - user is already a member
        if (err?.code === 'already-exists' || err?.code === 409 || err?.message?.includes('already-exists')) {
          if (isMounted) {
            setRole("listener");
            setJoined(true);
          }
        } else if (isMounted) {
          setMessage(err?.message || "Failed to join this mosque.");
        }
      } finally {
        if (isMounted) {
          setBusy(false);
        }
        joinInProgress = false;
      }
    };
    
    void join();
    
    return () => {
      isMounted = false;
    };
  }, [user, room, roomId, joinRoom, joined]);

  const handleLeave = async () => {
    if (!user) return;
    setBusy(true);
    setMessage(null);
    try {
      await leaveRoom(roomId);
      setRole(null);
      setJoined(false);
      setMessage("You left this mosque.");
      router.push("/rooms");
    } catch (err: any) {
      setRole(null);
      setJoined(false);
      setMessage(err?.message || "Left mosque (it may take a moment to refresh).");
      router.push("/rooms");
    } finally {
      setBusy(false);
    }
  };


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

          <div className="flex flex-wrap gap-3 mt-4">
            {user && (
              <button
                onClick={handleLeave}
                disabled={busy}
                className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Leave mosque
              </button>
            )}
          </div>
        </div>

        {/* Main content area - stacked rows */}
        <div className="space-y-6">
          {/* Translation card - first row */}
          {canTranslate ? (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
                <p className="font-medium">Lead reciter view</p>
                <p className="text-sm text-zinc-600">You are the only one who can start/stop translation.</p>
              </div>
              <div className="min-h-[500px]">
                <ClientApp 
                  mosqueId={roomId} 
                  translatorId={user?.uid} 
                  onClaimReciter={async () => {
                    await claimLeadReciter(roomId);
                    setRole("translator");
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
              {validTranslatorId ? (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  <p className="font-medium mb-2">Listener view</p>
                  <p className="text-sm text-zinc-600 mb-4">
                    You are listening to the lead reciter. The translation will appear here once they begin.
                  </p>
                  <div className="w-full border border-dashed border-zinc-300 rounded-lg p-8 text-sm text-zinc-500">
                    Waiting for lead reciter...
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
                    <p className="font-medium">Listener view</p>
                    <p className="text-sm text-zinc-600">No lead reciter yet. Click the record button to become the lead reciter.</p>
                  </div>
                  <ClientApp 
                    mosqueId={roomId} 
                    translatorId={user?.uid} 
                    onClaimReciter={async () => {
                      await claimLeadReciter(roomId);
                      setRole("translator");
                    }}
                  />
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

