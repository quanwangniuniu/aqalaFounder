"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Room, subscribeRoom, subscribeRoomMembers, RoomMember } from "@/lib/firebase/rooms";
import { auth } from "@/lib/firebase/config";
import ClientApp from "@/app/client-app";
import { useLiveKitBroadcast, BroadcastMessage } from "@/hooks/useLiveKitBroadcast";

// Audio feedback utility
const playAudioFeedback = (type: "enable" | "disable" | "connect") => {
  if (typeof window === "undefined") return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === "enable") {
      // Rising tone for enable
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } else if (type === "disable") {
      // Falling tone for disable
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } else if (type === "connect") {
      // Double beep for connect
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    }
  } catch (e) {
    // Ignore audio errors
  }
};

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, loading: authLoading, partnerInfo, partnerLoading } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [roomLoading, setRoomLoading] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [liveKitListeners, setLiveKitListeners] = useState(0);
  const [broadcastDuration, setBroadcastDuration] = useState("--:--");

  // LiveKit broadcast hook
  const {
    connect: connectLiveKit,
    disconnect: disconnectLiveKit,
    toggleAudio: toggleAudioRaw,
    sendMessage: sendLiveKitMessage,
    isConnected: isLiveKitConnected,
    isAudioEnabled,
    participantCount,
    error: liveKitError,
  } = useLiveKitBroadcast({
    roomName: partnerInfo?.mosqueId || "",
    participantName: user?.uid || "broadcaster",
    isPublisher: true,
    onParticipantCount: (count) => {
      setLiveKitListeners(count);
    },
  });

  // Wrap toggleAudio with sound effect
  const toggleAudio = useCallback(async () => {
    playAudioFeedback(isAudioEnabled ? "disable" : "enable");
    await toggleAudioRaw();
  }, [isAudioEnabled, toggleAudioRaw]);

  // Update duration every second when broadcasting
  useEffect(() => {
    if (!isBroadcasting || !room?.broadcastStartedAt) {
      setBroadcastDuration("--:--");
      return;
    }

    const updateDuration = () => {
      const ms = new Date().getTime() - room.broadcastStartedAt!.getTime();
      setBroadcastDuration(formatDuration(ms));
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [isBroadcasting, room?.broadcastStartedAt]);

  // Ref to send messages from ClientApp
  const sendMessageRef = useRef<(msg: BroadcastMessage) => void>(() => {});
  sendMessageRef.current = sendLiveKitMessage;

  // Redirect if not a partner or not logged in
  useEffect(() => {
    if (!authLoading && !partnerLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/admin");
        return;
      }
      if (!partnerInfo?.isPartner) {
        router.push("/");
        return;
      }
    }
  }, [user, authLoading, partnerInfo, partnerLoading, router]);

  // Initialize partner room via API
  useEffect(() => {
    if (!user || !partnerInfo?.isPartner) {
      return;
    }

    const initRoom = async () => {
      try {
        setRoomLoading(true);
        
        // Get Firebase ID token for API auth
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) {
          throw new Error("Not authenticated");
        }
        
        const response = await fetch("/api/broadcast/room", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${idToken}`,
          },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to get room");
        }
        
        // Parse dates from ISO strings
        const partnerRoom: Room = {
          ...data.room,
          createdAt: data.room.createdAt ? new Date(data.room.createdAt) : null,
          broadcastStartedAt: data.room.broadcastStartedAt ? new Date(data.room.broadcastStartedAt) : null,
        };
        
        setRoom(partnerRoom);
        setIsBroadcasting(!!partnerRoom.activeTranslatorId);
      } catch (err: any) {
        setError(err?.message || "Failed to initialize room");
      } finally {
        setRoomLoading(false);
      }
    };

    initRoom();
  }, [user, partnerInfo]);

  // Subscribe to room updates
  useEffect(() => {
    if (!partnerInfo?.mosqueId) return;

    const unsubscribe = subscribeRoom(
      partnerInfo.mosqueId,
      (updatedRoom) => {
        if (updatedRoom) {
          setRoom(updatedRoom);
          setIsBroadcasting(!!updatedRoom.activeTranslatorId);
        }
      },
      (err) => {
        console.error("Room subscription error:", err);
      }
    );

    return () => unsubscribe();
  }, [partnerInfo?.mosqueId]);

  // Subscribe to room members
  useEffect(() => {
    if (!partnerInfo?.mosqueId) return;

    const unsubscribe = subscribeRoomMembers(
      partnerInfo.mosqueId,
      (updatedMembers) => {
        setMembers(updatedMembers);
      },
      (err) => {
        console.error("Members subscription error:", err);
      }
    );

    return () => unsubscribe();
  }, [partnerInfo?.mosqueId]);

  // Forward Firebase liveStream updates to LiveKit
  useEffect(() => {
    console.log("[Admin] LiveStream forward check:", { isBroadcasting, isLiveKitConnected, mosqueId: partnerInfo?.mosqueId });
    if (!isBroadcasting || !isLiveKitConnected || !partnerInfo?.mosqueId) return;

    console.log("[Admin] Setting up LiveStream forwarding to LiveKit");
    
    // Import and subscribe to live stream
    const setupLiveStreamForward = async () => {
      const { subscribeLiveStream } = await import("@/lib/firebase/translationHistory");
      
      const unsubscribe = subscribeLiveStream(
        partnerInfo.mosqueId!,
        (stream) => {
          console.log("[Admin] LiveStream update:", stream?.isActive ? "active" : "inactive", stream);
          if (stream?.isActive) {
            // Forward translation to LiveKit
            const translationMsg = {
              type: "translation" as const,
              text: stream.currentText || "",
              partial: stream.partialText || "",
              lang: stream.targetLang || "",
              timestamp: Date.now(),
            };
            console.log("[Admin] Sending translation to LiveKit:", translationMsg);
            sendMessageRef.current(translationMsg);
            
            // Forward source to LiveKit
            if (stream.sourceText || stream.sourcePartial) {
              const sourceMsg = {
                type: "source" as const,
                text: stream.sourceText || "",
                partial: stream.sourcePartial || "",
                lang: stream.sourceLang || "",
                timestamp: Date.now(),
              };
              console.log("[Admin] Sending source to LiveKit:", sourceMsg);
              sendMessageRef.current(sourceMsg);
            }
          }
        },
        (err) => {
          console.error("LiveStream subscription error:", err);
        }
      );

      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    setupLiveStreamForward().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      unsubscribe?.();
    };
  }, [isBroadcasting, isLiveKitConnected, partnerInfo?.mosqueId]);

  const handleStartBroadcast = async () => {
    if (!room) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      // Get Firebase ID token for API auth
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch("/api/broadcast/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ roomId: room.id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to start broadcast");
      }
      
      // Connect to LiveKit for audio + data streaming
      await connectLiveKit();
      
      // Play connect sound
      playAudioFeedback("connect");
      
      setIsBroadcasting(true);
    } catch (err: any) {
      setError(err?.message || "Failed to start broadcast");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopBroadcast = async () => {
    if (!room) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      // Disconnect from LiveKit
      await disconnectLiveKit();
      
      // Get Firebase ID token for API auth
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch("/api/broadcast/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ roomId: room.id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to stop broadcast");
      }
      
      setIsBroadcasting(false);
    } catch (err: any) {
      setError(err?.message || "Failed to stop broadcast");
    } finally {
      setActionLoading(false);
    }
  };

  // Function to broadcast translation via LiveKit
  const broadcastTranslation = useCallback((translationText: string, partialText: string, targetLang: string) => {
    if (isLiveKitConnected) {
      sendMessageRef.current({
        type: "translation",
        text: translationText,
        partial: partialText,
        lang: targetLang,
        timestamp: Date.now(),
      });
    }
  }, [isLiveKitConnected]);

  // Function to broadcast source text via LiveKit
  const broadcastSource = useCallback((sourceText: string, partialText: string, sourceLang: string) => {
    if (isLiveKitConnected) {
      sendMessageRef.current({
        type: "source",
        text: sourceText,
        partial: partialText,
        lang: sourceLang,
        timestamp: Date.now(),
      });
    }
  }, [isLiveKitConnected]);

  // Loading state
  if (authLoading || partnerLoading || roomLoading) {
    return (
      <div className="min-h-screen bg-[#032117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!user || !partnerInfo?.isPartner) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#032117] text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">Partner Admin</h1>
                <p className="text-xs text-white/40">{partnerInfo.mosqueName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isBroadcasting && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-medium text-red-400">LIVE</span>
                </div>
              )}
              <Image
                src="/aqala-logo.png"
                alt="Aqala"
                width={80}
                height={28}
                className="opacity-40 brightness-0 invert"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6">
        {/* Error display */}
        {(error || liveKitError) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error || liveKitError}
            </div>
          </div>
        )}

        {/* Broadcast status card */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Broadcast Control</h2>
                <p className="text-sm text-white/50">
                  {isBroadcasting 
                    ? "Your broadcast is live. Listeners can join your room." 
                    : "Start broadcasting to go live and allow listeners to join."}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isBroadcasting ? "bg-red-500/20" : "bg-white/5"
              }`}>
                {isBroadcasting ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-semibold text-[#D4AF37] mb-1">
                  {isLiveKitConnected ? participantCount : 0}
                </div>
                <div className="text-xs text-white/40">Listening Now</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-semibold text-white mb-1">
                  {room?.memberCount || 0}
                </div>
                <div className="text-xs text-white/40">Total Joined</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-semibold text-white mb-1">
                  {broadcastDuration}
                </div>
                <div className="text-xs text-white/40">Duration</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  {isLiveKitConnected ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-sm font-semibold text-green-400">Live</span>
                    </>
                  ) : isBroadcasting ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      <span className="text-sm font-semibold text-yellow-400">Connecting</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                      <span className="text-sm font-semibold text-zinc-400">Offline</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-white/40">Stream Status</div>
              </div>
            </div>

            {/* Audio toggle (only when broadcasting) */}
            {isBroadcasting && isLiveKitConnected && (
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Audio Broadcast</p>
                    <p className="text-xs text-white/50">
                      {isAudioEnabled 
                        ? "Your microphone is being streamed to listeners" 
                        : "Enable to stream your audio to listeners"}
                    </p>
                  </div>
                  <button
                    onClick={toggleAudio}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isAudioEnabled
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-[#D4AF37] text-[#032117] hover:bg-[#E8D5A3]"
                    }`}
                  >
                    {isAudioEnabled ? (
                      <span className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                        Mute Audio
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                        Stream Audio
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {!isBroadcasting ? (
                <button
                  onClick={handleStartBroadcast}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#D4AF37] text-[#032117] rounded-xl font-semibold hover:bg-[#E8D5A3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#032117]/30 border-t-[#032117] rounded-full animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Start Broadcasting
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleStopBroadcast}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Stopping...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                      Stop Broadcasting
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live translation interface (only shown when broadcasting) */}
        {isBroadcasting && room && user && (
          <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-[#2a3142]">
            <div className="px-6 py-3 border-b border-[#2a3142]">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-sm text-white/70 font-medium">
                  Broadcasting Live — {members.filter(m => m.role === "listener").length} listening
                </span>
              </div>
            </div>
            <div className="h-[calc(100vh-480px)] min-h-[400px]">
              <ClientApp
                mosqueId={room.id}
                translatorId={user.uid}
                onClaimReciter={async () => {
                  // Already broadcasting - no action needed
                }}
                onReleaseReciter={async () => {
                  await handleStopBroadcast();
                }}
              />
            </div>
          </div>
        )}

        {/* Share link section */}
        <div className="mt-6 bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider mb-4">
            Share with your community
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-sm text-white/60 font-mono">
              {typeof window !== "undefined" 
                ? `${window.location.origin}/rooms/${partnerInfo.mosqueId}`
                : `/rooms/${partnerInfo.mosqueId}`}
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/rooms/${partnerInfo.mosqueId}`;
                navigator.clipboard.writeText(url);
                // Could add toast notification here
              }}
              className="px-4 py-3 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/15 transition-colors"
            >
              Copy Link
            </button>
          </div>
          <p className="mt-3 text-xs text-white/40">
            Share this link with your congregation so they can join and receive live translations.
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider mb-4">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] text-sm font-semibold">1</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Start your broadcast</p>
                <p className="text-xs text-white/50">Click the "Start Broadcasting" button when you're ready to begin</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] text-sm font-semibold">2</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Speak into your microphone</p>
                <p className="text-xs text-white/50">Aqala will transcribe and translate your speech in real-time</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] text-sm font-semibold">3</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Your community receives translations</p>
                <p className="text-xs text-white/50">Listeners who join your room will see the translation in their chosen language</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
