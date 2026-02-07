"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRooms } from "@/contexts/RoomsContext";
import { subscribeRoomMembers, RoomMember } from "@/lib/firebase/rooms";
import CreateRoomModal from "@/components/CreateRoomModal";
import AdBanner from "@/components/AdBanner";

export default function RoomsPage() {
  const { user, partnerInfo } = useAuth();
  const { rooms, loading } = useRooms();
  const [roomMembers, setRoomMembers] = useState<Record<string, RoomMember[]>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isPartner = partnerInfo?.isPartner ?? false;

  // Only show LIVE rooms - filter by activeTranslatorId
  const { livePartnerRooms, liveCommunityRooms } = useMemo(() => {
    // Only get rooms that are currently live
    const liveRooms = rooms.filter(r => r.activeTranslatorId);
    
    const partner = liveRooms.filter(r => r.isBroadcast === true || r.roomType === "partner");
    const community = liveRooms.filter(r => r.isBroadcast !== true && r.roomType !== "partner");
    
    return {
      livePartnerRooms: partner.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)),
      liveCommunityRooms: community.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)),
    };
  }, [rooms]);

  const totalLiveRooms = livePartnerRooms.length + liveCommunityRooms.length;

  // Subscribe to members for each room
  useEffect(() => {
    if (rooms.length === 0) {
      setRoomMembers({});
      return;
    }

    const unsubscribes: (() => void)[] = [];
    rooms.forEach((room) => {
      const unsubscribe = subscribeRoomMembers(
        room.id,
        (members) => {
          setRoomMembers((prev) => ({ ...prev, [room.id]: members }));
        },
        (err) => {
          if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
            return;
          }
          console.error(`Error loading members for room ${room.id}:`, err);
        }
      );
      unsubscribes.push(unsubscribe);
    });
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [rooms]);

  return (
    <div className="min-h-screen text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        
        <div className="relative px-5 py-8 max-w-2xl mx-auto">
          {/* Nav */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            
            {/* Create Room Button */}
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  isPartner
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#C49B30] hover:from-[#E0BC42] hover:to-[#D4AF37] text-[#0a1f16]"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Room
              </button>
            )}
          </div>

          {/* Hero content */}
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-white/60">{totalLiveRooms} {totalLiveRooms === 1 ? "room" : "rooms"} live now</span>
      </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Live Translation Rooms
            </h1>
            <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
              Join official partner mosques or community-hosted sessions for real-time Khutbah translation
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20">
              <p className="text-2xl font-bold text-[#D4AF37]">{livePartnerRooms.length}</p>
              <p className="text-xs text-white/40 mt-1">Partner Broadcasts</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-400">{liveCommunityRooms.length}</p>
              <p className="text-xs text-white/40 mt-1">Community Sessions</p>
            </div>
              </div>
            </div>
          </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-5 pb-12 space-y-8">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-2 border-white/5 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-[#D4AF37] rounded-full animate-spin" />
            </div>
            <span className="text-white/40 text-sm">Loading rooms...</span>
          </div>
        )}

        {/* Live Partner Broadcasts */}
        {!loading && livePartnerRooms.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                          <path d="M3 21h18" strokeLinecap="round" />
                          <path d="M5 21V7l7-4 7 4v14" />
                          <circle cx="12" cy="10" r="2" />
                        </svg>
                      </div>
                          <div>
                <h2 className="font-semibold text-white">Official Partners</h2>
                <p className="text-xs text-white/40">Verified mosque broadcasts</p>
              </div>
            </div>

          <div className="space-y-3">
              {livePartnerRooms.map((room) => (
                <RoomCard key={room.id} room={room} members={roomMembers[room.id] || []} />
            ))}
          </div>
        </section>
        )}

        {/* Ad Banner - Between sections */}
        {!loading && totalLiveRooms > 0 && (
          <AdBanner className="rounded-xl overflow-hidden" />
        )}

        {/* Live Community Rooms */}
        {!loading && liveCommunityRooms.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div>
                  <h2 className="font-semibold text-white">Community Sessions</h2>
                  <p className="text-xs text-white/40">User-hosted live rooms</p>
                </div>
                      </div>
                    </div>
            
            <div className="space-y-3">
              {liveCommunityRooms.map((room) => (
                <CommunityRoomCard key={room.id} room={room} members={roomMembers[room.id] || []} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state - no live rooms */}
        {!loading && totalLiveRooms === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white/70 mb-2">No live broadcasts right now</h3>
            <p className="text-white/40 text-sm mb-6">Check back later or start your own session!</p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C49B30] hover:from-[#E0BC42] hover:to-[#D4AF37] text-[#0a1f16] rounded-xl font-medium text-sm transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Start a Live Session
              </button>
            )}
          </div>
        )}

        {/* Not signed in CTA */}
        {!user && !loading && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 text-center">
            <h3 className="font-semibold text-white mb-2">Want to create a room?</h3>
            <p className="text-white/50 text-sm mb-4">Sign in to start your own translation session</p>
            <Link
              href="/auth/login?redirect=/rooms"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E0BC42] text-[#0a1f16] rounded-xl font-medium text-sm transition-colors"
            >
              Sign In
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Partnership CTA */}
        <section className="text-center py-8 space-y-3 border-t border-white/5 mt-8">
          <p className="text-sm text-white/40">
            Is your mosque interested in becoming an official partner?
          </p>
          <a
            href="mailto:info@aqala.io?subject=Mosque Partnership Inquiry"
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#E8D5A3] text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact us about partnerships
          </a>
        </section>

        {/* Footer */}
        <div className="text-center pb-6">
          <Image
            src="/aqala-logo.png"
            alt="Aqala"
            width={60}
            height={20}
            className="mx-auto opacity-20 brightness-0 invert"
          />
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

// Partner Room Card Component - All rooms shown are LIVE
function RoomCard({ room, members }: { room: any; members: RoomMember[] }) {
  // Use real-time members count for accurate viewer count
  const listenerCount = members.filter(m => m.role === "listener").length;
  const viewerCount = Math.max(listenerCount, members.length);
  
  return (
    <Link
      href={`/rooms/${room.id}`}
      className="block rounded-2xl p-4 border transition-all group bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-red-500/20 hover:border-red-500/40 hover:bg-red-500/15"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 bg-red-500/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
            <path d="M3 21h18" strokeLinecap="round" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-6h6v6" />
            <circle cx="12" cy="10" r="2" />
          </svg>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold transition-colors text-white group-hover:text-red-400">
                {room.partnerName || room.name}
              </h3>
              {room.description && (
                <p className="text-xs text-white/40 line-clamp-1 mt-0.5">{room.description}</p>
              )}
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
              {viewerCount} watching
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#D4AF37]/10 text-[#D4AF37]">
              OFFICIAL
            </span>
          </div>
        </div>
        
        {/* Arrow */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 transition-colors text-white/20 group-hover:text-red-400">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}

// Community Room Card Component - All rooms shown are LIVE
function CommunityRoomCard({ room, members }: { room: any; members: RoomMember[] }) {
  // Use real-time members count for accurate viewer count
  const viewerCount = members.length;
  
  return (
    <Link
      href={`/rooms/${room.id}`}
      className="flex items-center justify-between rounded-xl p-3.5 border transition-all group bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate transition-colors text-white group-hover:text-emerald-400">
              {room.name}
            </p>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold shrink-0">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-white/40">
              by {room.ownerName || "Anonymous"}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/50">
              {viewerCount} {viewerCount === 1 ? "viewer" : "viewers"}
            </span>
          </div>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 transition-colors text-white/20 group-hover:text-emerald-400">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}
