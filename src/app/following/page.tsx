"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getFollowing, FollowUser } from "@/lib/firebase/follows";
import FollowButton from "@/components/FollowButton";

export default function FollowingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?redirect=/following");
      return;
    }

    const loadFollowing = async () => {
      try {
        const data = await getFollowing(user.uid);
        setFollowing(data);
      } catch (error) {
        console.error("Failed to load following:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFollowing();
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
            <h1 className="text-lg font-semibold">Following</h1>
            <p className="text-sm text-white/50">{following.length} people</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <Link
          href="/following"
          className="flex-1 py-3 text-center text-sm font-medium border-b-2 border-[#D4AF37] text-[#D4AF37]"
        >
          Following
        </Link>
        <Link
          href="/followers"
          className="flex-1 py-3 text-center text-sm font-medium border-b-2 border-transparent text-white/50 hover:text-white/70 transition-colors"
        >
          Followers
        </Link>
      </div>

      {/* List */}
      <div className="max-w-lg mx-auto px-5 py-4">
        {following.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-white/50 text-sm">You're not following anyone yet</p>
            <p className="text-white/30 text-xs mt-1">Find people to follow in live rooms</p>
          </div>
        ) : (
          <div className="space-y-3">
            {following.map((followedUser) => (
              <div
                key={followedUser.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                {/* Avatar */}
                <Link href={`/user/${followedUser.id}`} className="flex-shrink-0">
                  {followedUser.photoURL ? (
                    <Image
                      src={followedUser.photoURL}
                      alt={followedUser.username || followedUser.displayName || "User"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-semibold">
                      {(followedUser.username || followedUser.displayName || "U")[0].toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* Info */}
                <Link href={`/user/${followedUser.id}`} className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {followedUser.displayName || followedUser.username || "User"}
                  </p>
                  {followedUser.username && (
                    <p className="text-sm text-white/50 truncate">@{followedUser.username}</p>
                  )}
                </Link>

                {/* Follow Button */}
                <FollowButton
                  targetUserId={followedUser.id}
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
