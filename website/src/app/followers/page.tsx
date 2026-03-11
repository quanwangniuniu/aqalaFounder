"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getFollowers, FollowUser } from "@/lib/firebase/follows";
import FollowButton from "@/components/FollowButton";

export default function FollowersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?redirect=/followers");
      return;
    }

    const loadFollowers = async () => {
      try {
        const data = await getFollowers(user.uid);
        setFollowers(data);
      } catch (error) {
        console.error("Failed to load followers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFollowers();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold">Followers</h1>
            <p className="text-sm text-white/50">{followers.length} people</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <Link
          href="/following"
          className="flex-1 py-3 text-center text-sm font-medium border-b-2 border-transparent text-white/50 hover:text-white/70 transition-colors"
        >
          Following
        </Link>
        <Link
          href="/followers"
          className="flex-1 py-3 text-center text-sm font-medium border-b-2 border-[#D4AF37] text-[#D4AF37]"
        >
          Followers
        </Link>
      </div>

      {/* List */}
      <div className="max-w-lg mx-auto px-5 py-4">
        {followers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-white/50 text-sm">No followers yet</p>
            <p className="text-white/30 text-xs mt-1">Start a live room to grow your audience</p>
          </div>
        ) : (
          <div className="space-y-3">
            {followers.map((follower) => (
              <div
                key={follower.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                {/* Avatar */}
                <Link href={`/user/${follower.id}`} className="flex-shrink-0">
                  {follower.photoURL ? (
                    <Image
                      src={follower.photoURL}
                      alt={follower.username || follower.displayName || "User"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-semibold">
                      {(follower.username || follower.displayName || "U")[0].toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* Info */}
                <Link href={`/user/${follower.id}`} className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {follower.displayName || follower.username || "User"}
                  </p>
                  {follower.username && (
                    <p className="text-sm text-white/50 truncate">@{follower.username}</p>
                  )}
                </Link>

                {/* Follow Back Button */}
                <FollowButton
                  targetUserId={follower.id}
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
