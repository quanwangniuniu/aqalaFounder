"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRooms } from "@/contexts/RoomsContext";
import {
  subscribeRoomMembers,
  RoomMember,
  getRoom,
  Room,
} from "@/lib/firebase/rooms";
import ClientApp from "@/app/client-app";
import LiveTranslationView from "@/components/LiveTranslationView";
import { getUserDisplayName } from "@/utils/userDisplay";

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const {
    rooms,
    joinRoom,
    claimLeadReciter,
    validateAndCleanTranslator,
    releaseTranslator,
  } = useRooms();

  // For authenticated users, get room from rooms context; for unauthenticated, fetch directly
  const roomFromContext = useMemo(
    () => rooms.find((r) => r.id === roomId),
    [rooms, roomId]
  );
  const [directRoom, setDirectRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);

  const room = roomFromContext || directRoom;

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [role, setRole] = useState<"translator" | "listener" | null>(null);
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState<RoomMember[]>([]);

  // Reset state when roomId changes
  useEffect(() => {
    setMessage(null);
    setJoined(false);
    setRole(null);
    setMembers([]);
    setDirectRoom(null);
  }, [roomId]);

  // Fetch room directly if user is not authenticated and room is not in context
  useEffect(() => {
    if (!user && !roomFromContext && roomId && !roomLoading) {
      setRoomLoading(true);
      getRoom(roomId)
        .then((fetchedRoom) => {
          setDirectRoom(fetchedRoom);
          setRoomLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching room:", err);
          setRoomLoading(false);
        });
    } else if (user || roomFromContext) {
      // Clear direct room if user becomes authenticated or room appears in context
      setDirectRoom(null);
      setRoomLoading(false);
    }
  }, [user, roomFromContext, roomId]);

  // Check if activeTranslatorId is valid
  // For authenticated users, validate against members list
  // For unauthenticated users, just use the room's activeTranslatorId directly
  const validTranslatorId = useMemo(() => {
    if (!room?.activeTranslatorId) return null;
    if (!user) {
      // Unauthenticated: just use the activeTranslatorId from room
      return room.activeTranslatorId;
    }
    // Authenticated: validate it exists in members
    const translatorMember = members.find(
      (m) => m.userId === room.activeTranslatorId
    );
    return translatorMember ? room.activeTranslatorId : null;
  }, [room?.activeTranslatorId, members, user]);

  const isTranslator =
    user && (validTranslatorId === user.uid || role === "translator");
  const canTranslate = !!user && !!isTranslator;

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
        if (
          err?.code === "permission-denied" ||
          err?.message?.includes("permission")
        ) {
          setMembers([]);
          return;
        }
        console.error("Error loading members:", err);
      }
    );
    return () => unsubscribe();
  }, [roomId, user, validateAndCleanTranslator]);

  // Validate translator when room data changes (only for authenticated users)
  useEffect(() => {
    if (user && roomId && room?.activeTranslatorId) {
      validateAndCleanTranslator(roomId).catch((err) => {
        console.error("Error validating translator:", err);
      });
    }
  }, [user, roomId, room?.activeTranslatorId, validateAndCleanTranslator]);

  // Auto-join on load: always join as listener (no automatic translator assignment)
  const joinInProgressRef = useRef(false);
  useEffect(() => {
    let isMounted = true;

    const join = async () => {
      if (!user || !room || joined || joinInProgressRef.current) {
        console.log(
          `[JOIN MOSQUE UI] Skipping join - user: ${user?.uid}, room: ${room?.id}, joined: ${joined}, joinInProgress: ${joinInProgressRef.current}`
        );
        return;
      }
      console.log(
        `[JOIN MOSQUE UI] Initiating join - roomId: ${roomId}, userId: ${user.uid}`
      );
      joinInProgressRef.current = true;
      setBusy(true);
      try {
        await joinRoom(roomId, false); // Always join as listener
        console.log(
          `[JOIN MOSQUE UI] Join successful - roomId: ${roomId}, userId: ${user.uid}`
        );
        if (isMounted) {
          setRole("listener");
          setMessage(
            "You joined as listener. Click record to become lead reciter."
          );
          setJoined(true);
        }
      } catch (err: any) {
        console.error(
          `[JOIN MOSQUE UI] Join error - roomId: ${roomId}, userId: ${user.uid}, errorCode: ${err?.code}, error:`,
          err
        );
        // Ignore "already-exists" errors - user is already a member
        if (
          err?.code === "already-exists" ||
          err?.code === 409 ||
          err?.message?.includes("already-exists")
        ) {
          console.log(
            `[JOIN MOSQUE UI] Already exists (treated as success) - roomId: ${roomId}, userId: ${user.uid}`
          );
          if (isMounted) {
            setRole("listener");
            setJoined(true);
          }
        } else if (
          err?.code === "failed-precondition" ||
          err?.code === 9 ||
          err?.code === "ABORTED" ||
          err?.message?.includes("concurrent modification")
        ) {
          // Transaction conflict - check if user is actually a member now
          console.log(
            `[JOIN MOSQUE UI] Transaction conflict - roomId: ${roomId}, userId: ${user.uid}, checking membership status`
          );
          // The backend already checked, so if we get here, the join likely failed
          if (isMounted) {
            setMessage(
              "Failed to join due to concurrent changes. Please refresh and try again."
            );
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

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-[#0f1318] px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Room</h1>
            <Link
              href="/rooms"
              className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              ← Back
            </Link>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <div className="w-4 h-4 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin"></div>
            Loading room...
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0f1318] px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Room</h1>
            <Link
              href="/rooms"
              className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              ← Back
            </Link>
          </div>
          <p className="text-zinc-500">Room not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1318]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">{room.name}</h1>
              <p className="text-sm text-zinc-500">
                {user ? (
                  <>
                    {room.memberCount} members •{" "}
                    {validTranslatorId
                      ? (() => {
                          const translatorMember = members.find(
                            (m) => m.userId === validTranslatorId
                          );
                          return `Lead: ${getUserDisplayName(
                            null,
                            validTranslatorId,
                            translatorMember?.email
                          )}`;
                        })()
                      : "No lead reciter"}
                  </>
                ) : (
                  <>
                    {validTranslatorId
                      ? "Live translation in progress"
                      : "Waiting for lead reciter"}
                  </>
                )}
              </p>
            </div>
            <Link
              href="/rooms"
              className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              ← Back
            </Link>
          </div>

          {message && user && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
              {message}
            </div>
          )}
        </div>

        {/* Main content area - stacked rows */}
        <div className="space-y-6">
          {/* Translation card - first row */}
          {!user ? (
            /* Unauthenticated view: translations only, no buttons */
            <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-150px)] flex flex-col ring-1 ring-[#2a3142]">
              {validTranslatorId ? (
                <LiveTranslationView
                  mosqueId={roomId}
                  activeTranslatorId={validTranslatorId}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#2a3142] flex items-center justify-center mb-4">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="1.5"
                    >
                      <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
                      <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H10a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
                    </svg>
                  </div>
                  <p className="text-zinc-400 text-lg mb-2">
                    Waiting for lead reciter
                  </p>
                  <p className="text-zinc-600 text-sm">
                    Sign in to become the lead reciter
                  </p>
                </div>
              )}
            </div>
          ) : canTranslate ? (
            <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-[#2a3142]">
              <div className="px-6 py-3 border-b border-[#2a3142]">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm text-zinc-400 font-medium">
                    Lead Reciter
                  </span>
                </div>
              </div>
              <div className="h-[calc(100vh-200px)]">
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
            <>
              {/* Translation card */}
              <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-280px)] flex flex-col ring-1 ring-[#2a3142]">
                {validTranslatorId ? (
                  <LiveTranslationView
                    mosqueId={roomId}
                    activeTranslatorId={validTranslatorId}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-zinc-500 text-sm">
                      No lead reciter yet. Tap to start translating.
                    </p>
                  </div>
                )}
              </div>

              {/* Mic button - always visible below the card */}
              {user && (
                <div className="mt-6 flex flex-col items-center">
                  <p className="text-sm text-zinc-500 mb-4 text-center">
                    {validTranslatorId ? (
                      <>
                        Listening to{" "}
                        {(() => {
                          const translatorMember = members.find(
                            (m) => m.userId === validTranslatorId
                          );
                          return getUserDisplayName(
                            null,
                            validTranslatorId,
                            translatorMember?.email
                          );
                        })()}{" "}
                        • Tap to become lead reciter
                      </>
                    ) : (
                      "Tap to become lead reciter"
                    )}
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await claimLeadReciter(roomId);
                        setRole("translator");
                      } catch (err: any) {
                        setMessage(
                          err?.message ||
                            "Failed to become lead reciter. Please try again."
                        );
                      }
                    }}
                    aria-label="Start recording to become lead reciter"
                    className="relative h-16 w-16 rounded-full flex items-center justify-center transition-all outline-none focus:outline-none ring-0 focus:ring-0 no-tap-highlight bg-[#0A84FF] hover:bg-[#0066CC] hover:scale-105 shadow-lg shadow-blue-500/25"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
