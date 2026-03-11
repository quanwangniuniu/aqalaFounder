"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRooms } from "@/contexts/RoomsContext";
import {
  subscribeRoomMembers,
  RoomMember,
  getRoom,
  Room,
  leaveRoom,
} from "@/lib/firebase/rooms";
import {
  startListeningSession,
  recordListeningSession,
} from "@/lib/firebase/listenerStats";
import ClientApp from "@/app/client-app";
import LiveTranslationView from "@/components/LiveTranslationView";
import LiveKitListener from "@/components/LiveKitListener";
import LiveChat from "@/components/LiveChat";
import EditRoomModal from "@/components/EditRoomModal";

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, partnerInfo } = useAuth();
  const router = useRouter();
  const {
    rooms,
    loading: roomsLoading,
    joinRoom,
    claimLeadReciter,
    validateAndCleanTranslator,
    releaseTranslator,
    deleteRoom,
  } = useRooms();

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
  const [showChat, setShowChat] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const sessionStartRef = useRef<{ startedAt: number; roomName: string } | null>(null);
  const roomMenuRef = useRef<HTMLDivElement>(null);
  const hasAttemptedDirectFetch = useRef(false);

  const handleDeleteRoom = useCallback(async () => {
    if (!roomId || !user) return;
    setIsDeleting(true);
    try {
      await deleteRoom(roomId);
      router.push("/rooms");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to delete room");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setShowRoomMenu(false);
    }
  }, [roomId, user, deleteRoom, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roomMenuRef.current && !roomMenuRef.current.contains(e.target as Node)) {
        setShowRoomMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup: record listening session, then leave room on unmount
  useEffect(() => {
    if (!roomId || !user) return;

    return () => {
      const session = sessionStartRef.current;
      if (session) {
        const durationSeconds = Math.floor(
          (Date.now() - session.startedAt) / 1000
        );
        recordListeningSession(
          user.uid,
          roomId,
          session.roomName,
          durationSeconds
        ).catch((err) =>
          console.error("[ListenerStats] Failed to record session:", err)
        );
        sessionStartRef.current = null;
      }
      leaveRoom(roomId, user.uid);
    };
  }, [roomId, user]);

  // Session elapsed timer (same as listen page) - tick every second while in room
  useEffect(() => {
    if (!joined || !sessionStartRef.current) {
      setElapsedSeconds(0);
      return;
    }
    const id = setInterval(() => {
      if (sessionStartRef.current) {
        setElapsedSeconds(
          Math.floor((Date.now() - sessionStartRef.current.startedAt) / 1000)
        );
      }
    }, 1000);
    return () => {
      clearInterval(id);
      setElapsedSeconds(0);
    };
  }, [joined]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset state when roomId changes
  useEffect(() => {
    setMessage(null);
    setJoined(false);
    setRole(null);
    setMembers([]);
    setDirectRoom(null);
    sessionStartRef.current = null;
    hasAttemptedDirectFetch.current = false;
  }, [roomId]);

  // Fetch room directly if user is not authenticated
  useEffect(() => {
    if (!user && !roomFromContext && roomId && !roomLoading) {
      hasAttemptedDirectFetch.current = true;
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
      setDirectRoom(null);
      setRoomLoading(false);
    }
  }, [user, roomFromContext, roomId]);

  // Redirect to list when room was deleted (not found after load)
  useEffect(() => {
    if (!roomId) return;
    const loadingDone = user
      ? !roomsLoading
      : hasAttemptedDirectFetch.current
        ? !roomLoading
        : !roomsLoading;
    if (loadingDone && !room) {
      router.replace("/rooms");
    }
  }, [roomId, room, user, roomsLoading, roomLoading, router]);

  // Check if activeTranslatorId is valid
  const validTranslatorId = useMemo(() => {
    if (!room?.activeTranslatorId) return null;
    if (!user) return room.activeTranslatorId;
    const translatorMember = members.find(
      (m) => m.userId === room.activeTranslatorId
    );
    return translatorMember ? room.activeTranslatorId : null;
  }, [room?.activeTranslatorId, members, user]);

  const isTranslator =
    user && (validTranslatorId === user.uid || role === "translator");
  const canTranslate = !!user && !!isTranslator;

  const isBroadcastRoom = room?.isBroadcast === true;
  const isPartnerRoom = room?.roomType === "partner" || isBroadcastRoom;
  const isPartnerOfRoom = user && room?.partnerId === user.uid;
  const isRoomOwner = user && room?.ownerId === user.uid;
  // Only room owner or partner can claim reciter - NOT regular listeners
  const canClaimReciter = isRoomOwner || isPartnerOfRoom;
  const isLive = !!validTranslatorId;

  // Subscribe to members (works for all users, Firebase rules handle permissions)
  useEffect(() => {
    if (!roomId) {
      setMembers([]);
      return;
    }
    const unsubscribe = subscribeRoomMembers(
      roomId,
      (incoming) => {
        setMembers(incoming);
        if (user) {
          validateAndCleanTranslator(roomId).catch(() => {});
        }
      },
      (err) => {
        // Silently handle permission errors - viewer count will fall back to room.memberCount
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          setMembers([]);
          return;
        }
        console.error("Error loading members:", err);
      }
    );
    return () => unsubscribe();
  }, [roomId, user, validateAndCleanTranslator]);

  // Auto-join on load
  const joinInProgressRef = useRef(false);
  useEffect(() => {
    let isMounted = true;

    const join = async () => {
      if (!user || !room || joined || joinInProgressRef.current) return;
      
      joinInProgressRef.current = true;
      setBusy(true);
      try {
        await joinRoom(roomId, false);
        if (isMounted) {
          const roomName = room?.partnerName || room?.name || roomId;
          sessionStartRef.current = {
            startedAt: startListeningSession(),
            roomName,
          };
          setRole("listener");
          setJoined(true);
        }
      } catch (err: any) {
        if (err?.code === "already-exists" || err?.message?.includes("already-exists")) {
          if (isMounted) {
            const roomName = room?.partnerName || room?.name || roomId;
            sessionStartRef.current = {
              startedAt: startListeningSession(),
              roomName,
            };
            setRole("listener");
            setJoined(true);
          }
        } else if (isMounted) {
          setMessage(err?.message || "Failed to join this room.");
        }
      } finally {
        if (isMounted) setBusy(false);
        joinInProgressRef.current = false;
      }
    };

    void join();
    return () => {
      isMounted = false;
      joinInProgressRef.current = false;
    };
  }, [user, room, roomId, joinRoom, joined]);

  // Handle become lead reciter
  const handleClaimReciter = useCallback(async () => {
    try {
      await claimLeadReciter(roomId);
      setRole("translator");
    } catch (err: any) {
      setMessage(err?.message || "Failed to become lead reciter");
    }
  }, [roomId, claimLeadReciter]);

  // Loading state
  if (roomLoading) {
    return (
      <div className="min-h-screen bg-[#0a0c0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/5 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
          <p className="text-white/30 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!room) {
    return (
      <div className="min-h-screen bg-[#0a0c0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Room not found</h2>
          <p className="text-white/40 text-sm mb-6">This room doesn't exist or has been deleted.</p>
            <Link
              href="/rooms"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-white text-sm font-medium transition-colors"
            >
            ← Back to rooms
            </Link>
        </div>
      </div>
    );
  }

  // Use room.memberCount (managed by join/leave transactions)
  // Falls back to members.length if memberCount is somehow missing
  const viewerCount = room?.memberCount || members.length || 0;

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-white flex flex-col">
      {/* Compact Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-[#0a0c0f]/95 backdrop-blur-sm sticky top-0 z-[70]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Left side - Back + Room info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/rooms"
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-white truncate">
                  {room.partnerName || room.name}
                </h1>
                {isPartnerRoom && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20">
                    OFFICIAL
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                {viewerCount} watching
              </div>
            </div>
          </div>

          {/* Right side - Session time + Status + Chat toggle */}
          <div className="flex items-center gap-2">
            {joined && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                aria-label="Session time"
              >
                <span className="text-[9px] text-[#D4AF37] font-semibold tabular-nums">
                  {Math.floor(elapsedSeconds / 60)}:
                  {(elapsedSeconds % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
            {isLive && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold text-red-400 tracking-wide">LIVE</span>
            </div>
          )}

            {room.chatEnabled && (
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                  showChat 
                    ? "bg-[#D4AF37]/20 text-[#D4AF37]" 
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs font-medium">Chat</span>
              </button>
            )}
            {isRoomOwner && (
              <div className="relative" ref={roomMenuRef}>
                <button
                  onClick={() => setShowRoomMenu(!showRoomMenu)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Room settings"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
                {showRoomMenu && (
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 rounded-xl bg-[#0d1117] border border-white/10 shadow-xl z-50">
                    <button
                      onClick={() => { setShowEditModal(true); setShowRoomMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit Room
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(true); setShowRoomMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      Delete Room
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Translation View */}
        <div className={`flex-1 flex flex-col min-h-0 transition-all ${
          showChat && !isMobileView ? "lg:mr-[360px]" : ""
        }`}>
          {/* Content wrapper */}
          <div className="flex-1 flex flex-col overflow-hidden">
          {!user ? (
              // Unauthenticated view - full height wrapper
              <div className="flex-1 flex flex-col overflow-hidden">
                {isBroadcastRoom ? (
                  <LiveKitListener
                    roomName={roomId}
                    listenerName={`guest-${Date.now()}`}
                    mosqueName={room?.name || room?.partnerName || undefined}
                    hideHeader
                  />
                ) : validTranslatorId ? (
                  <LiveTranslationView
                    mosqueId={roomId}
                    activeTranslatorId={validTranslatorId}
                  />
                ) : (
                  <WaitingState 
                    message="Waiting for session to start"
                    subMessage="Sign in to become the lead reciter"
                  />
                )}
              </div>
          ) : canTranslate ? (
              // Translator view
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-shrink-0 px-4 py-2 border-b border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm text-emerald-400 font-medium">Broadcasting as Lead Reciter</span>
                </div>
                <div className="flex-1 overflow-hidden">
                <ClientApp
                  mosqueId={roomId}
                  translatorId={user?.uid}
                    onClaimReciter={handleClaimReciter}
                  onReleaseReciter={async () => {
                    await releaseTranslator(roomId);
                    setRole("listener");
                  }}
                />
              </div>
            </div>
          ) : (
              // Listener view - full height wrapper
              <div className="flex-1 flex flex-col overflow-hidden">
                {isBroadcastRoom ? (
                  <LiveKitListener
                    roomName={roomId}
                    listenerName={user?.uid || `listener-${Date.now()}`}
                    mosqueName={room?.name || room?.partnerName || undefined}
                    hideHeader
                  />
                ) : validTranslatorId ? (
                  <LiveTranslationView
                    mosqueId={roomId}
                    activeTranslatorId={validTranslatorId}
                  />
                ) : (
                  <WaitingState
                    message="Waiting for session to start"
                    subMessage={canClaimReciter ? "Tap below to start translating" : undefined}
                    action={
                      canClaimReciter && user ? (
                        <button
                          onClick={handleClaimReciter}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8963A] hover:from-[#E5C04C] hover:to-[#D4AF37] text-black font-semibold rounded-xl shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-105"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
                            <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H10a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
                          </svg>
                          Start Session
                        </button>
                      ) : undefined
                    }
                  />
                )}
              </div>
                )}
              </div>

          {/* Message banner */}
          {message && (
            <div className="flex-shrink-0 p-3 bg-amber-500/10 border-t border-amber-500/20">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  {message}
                </div>
                  <button
                  onClick={() => setMessage(null)}
                  className="p-1 hover:bg-amber-500/20 rounded transition-colors"
                  >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel - Desktop sidebar (outside overflow container) */}
      {room.chatEnabled && showChat && !isMobileView && (
        <aside className="fixed right-0 top-[57px] bottom-0 w-[360px] border-l border-white/5 bg-[#0d0f12] z-[60]">
          <LiveChat
            roomId={roomId}
            isPartnerRoom={isPartnerRoom}
            ownerId={room.ownerId}
            donationsEnabled={room.donationsEnabled}
            className="h-full"
          />
        </aside>
      )}

      {/* Chat Panel - Mobile overlay (outside overflow container) */}
      {room.chatEnabled && showChat && isMobileView && (
        <div className="fixed inset-0 z-[100] bg-[#0a0c0f] flex flex-col animate-in slide-in-from-bottom duration-200">
          <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#0a0c0f]">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="font-semibold text-white">Live Chat</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <LiveChat
            roomId={roomId}
            isPartnerRoom={isPartnerRoom}
            ownerId={room.ownerId}
            donationsEnabled={room.donationsEnabled}
            className="flex-1"
            hideHeader
          />
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && room && (
        <EditRoomModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          room={room}
        />
      )}

      {/* Delete Room Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0d1117] border border-white/10 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Room</h3>
            <p className="text-sm text-white/60 mb-6">This will permanently delete the room and all its data. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => !isDeleting && setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Waiting state component
function WaitingState({ 
  message, 
  subMessage, 
  action 
}: { 
  message: string; 
  subMessage?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      {/* Elegant waiting animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white/20">
            <path
              d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        {/* Animated rings */}
        <div 
          className="absolute inset-0 w-24 h-24 rounded-full border border-white/5"
          style={{ animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite" }}
        />
        <div 
          className="absolute -inset-4 w-32 h-32 rounded-full border border-white/[0.03]"
          style={{ animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite", animationDelay: "0.5s" }}
        />
      </div>
      
      <h3 className="text-lg font-medium text-white/60 mb-2">{message}</h3>
      {subMessage && (
        <p className="text-sm text-white/30 mb-6">{subMessage}</p>
      )}
      {action}

      <style jsx>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.5; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
