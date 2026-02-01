"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRooms } from "@/contexts/RoomsContext";
import { subscribeRoomMembers, RoomMember } from "@/lib/firebase/rooms";

// Partner mosques (dummy data for now)
const PARTNER_MOSQUES = [
  // Australia
  {
    id: "redfern-mosque",
    name: "Redfern Mosque",
    location: "Sydney, Australia",
    description: "One of Sydney's most historic mosques, serving the community since 1977.",
    isLive: false,
    nextKhutbah: "Friday 1:00 PM AEDT",
    region: "Australia",
  },
  {
    id: "icmg-botany",
    name: "ICMG Botany Masjid",
    location: "Sydney, Australia",
    description: "Islamic Centre of Mascot & Gardeners, a vibrant community hub.",
    isLive: true,
    nextKhutbah: "Live Now",
    region: "Australia",
  },
  {
    id: "zetland-mosque",
    name: "Zetland Mosque",
    location: "Sydney, Australia",
    description: "Serving the growing Muslim community in Sydney's inner south.",
    isLive: false,
    nextKhutbah: "Friday 1:15 PM AEDT",
    region: "Australia",
  },
  // United Kingdom
  {
    id: "east-london-mosque",
    name: "East London Mosque",
    location: "London, UK",
    description: "One of the largest mosques in Europe, a cornerstone of British Muslim life.",
    isLive: false,
    nextKhutbah: "Friday 1:30 PM GMT",
    region: "Europe",
  },
  {
    id: "birmingham-central",
    name: "Birmingham Central Mosque",
    location: "Birmingham, UK",
    description: "The first purpose-built mosque in Birmingham, serving thousands weekly.",
    isLive: false,
    nextKhutbah: "Friday 1:00 PM GMT",
    region: "Europe",
  },
  // North America
  {
    id: "isna-mississauga",
    name: "ISNA Islamic Centre",
    location: "Mississauga, Canada",
    description: "One of the largest Islamic centres in North America.",
    isLive: false,
    nextKhutbah: "Friday 1:30 PM EST",
    region: "North America",
  },
  {
    id: "dar-al-hijrah",
    name: "Dar Al-Hijrah",
    location: "Virginia, USA",
    description: "A leading mosque serving the Muslim community in the Washington DC area.",
    isLive: false,
    nextKhutbah: "Friday 1:15 PM EST",
    region: "North America",
  },
  // Middle East
  {
    id: "al-azhar",
    name: "Al-Azhar Mosque",
    location: "Cairo, Egypt",
    description: "One of the oldest and most prestigious mosques in the Islamic world.",
    isLive: true,
    nextKhutbah: "Live Now",
    region: "Middle East",
  },
  // Southeast Asia
  {
    id: "istiqlal-mosque",
    name: "Istiqlal Mosque",
    location: "Jakarta, Indonesia",
    description: "The largest mosque in Southeast Asia and a symbol of Indonesian Islam.",
    isLive: false,
    nextKhutbah: "Friday 12:00 PM WIB",
    region: "Asia",
  },
];

export default function RoomsPage() {
  const { user } = useAuth();
  const { rooms, loading } = useRooms();
  const [roomMembers, setRoomMembers] = useState<Record<string, RoomMember[]>>({});

  const sortedRooms = useMemo(
    () => rooms.slice().sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)),
    [rooms]
  );

  // Subscribe to members for each room
  useEffect(() => {
    if (!user || rooms.length === 0) {
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
  }, [rooms, user]);

  return (
    <div className="min-h-screen bg-[#032117] text-white">
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/" 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold">Partner Mosques</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Mosques Around the World</h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
              Aqala partners with mosques worldwide to bring their khutbahs and talks directly to you — 
              with real-time translation so you can truly understand, no matter where you are.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
          <h3 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] text-sm font-semibold">1</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Join a mosque room</p>
                <p className="text-xs text-white/50">Select a partner mosque from the list below</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] text-sm font-semibold">2</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Listen during live sessions</p>
                <p className="text-xs text-white/50">Tune in during khutbahs and lectures</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] text-sm font-semibold">3</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Receive real-time translation</p>
                <p className="text-xs text-white/50">Understand every word in your language</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Mosques */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider">
              Partner Mosques
            </h3>
            <span className="text-xs text-white/40">{PARTNER_MOSQUES.length} locations</span>
          </div>
          
          {/* Live mosques first */}
          {PARTNER_MOSQUES.some(m => m.isLive) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Live Now</span>
              </div>
              <div className="space-y-2">
                {PARTNER_MOSQUES.filter(m => m.isLive).map((mosque) => (
                  <Link
                    key={mosque.id}
                    href={`/rooms/${mosque.id}`}
                    className="block bg-red-500/5 hover:bg-red-500/10 rounded-2xl p-4 border border-red-500/20 hover:border-red-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                          <path d="M3 21h18" strokeLinecap="round" />
                          <path d="M5 21V7l7-4 7 4v14" />
                          <path d="M9 21v-6h6v6" />
                          <circle cx="12" cy="10" r="2" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors">
                              {mosque.name}
                            </h4>
                            <p className="text-xs text-white/40">{mosque.location}</p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            Live
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mt-1 line-clamp-1">{mosque.description}</p>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 group-hover:text-red-400 transition-colors shrink-0">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All mosques by region */}
          <div className="space-y-3">
            {PARTNER_MOSQUES.filter(m => !m.isLive).map((mosque) => (
              <Link
                key={mosque.id}
                href={`/rooms/${mosque.id}`}
                className="block bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/5 hover:border-[#D4AF37]/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Mosque icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                      <path d="M3 21h18" strokeLinecap="round" />
                      <path d="M5 21V7l7-4 7 4v14" />
                      <path d="M9 21v-6h6v6" />
                      <circle cx="12" cy="10" r="2" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                          {mosque.name}
                        </h4>
                        <p className="text-xs text-white/40">{mosque.location}</p>
                      </div>
                      <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                        {mosque.region}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mt-1 line-clamp-2">{mosque.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-xs text-white/40">
                        Next: {mosque.nextKhutbah}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 group-hover:text-[#D4AF37] transition-colors shrink-0">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* User-created rooms (if any exist) */}
        {sortedRooms.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-white/40 mb-4 uppercase tracking-wider">
              Community Rooms
            </h3>
            <div className="space-y-2">
              {sortedRooms.map((room) => {
                const members = roomMembers[room.id] || [];
                return (
                  <Link
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{room.name}</p>
                        <p className="text-xs text-white/40">{members.length} listening</p>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Partnership CTA */}
        <section className="text-center py-6 space-y-3">
          <p className="text-sm text-white/40">
            Is your mosque interested in partnering with Aqala?
          </p>
          <a
            href="mailto:hello@aqala.io?subject=Mosque Partnership Inquiry"
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#E8D5A3] text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact us about partnerships
          </a>
        </section>

        {/* App info */}
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
    </div>
  );
}
