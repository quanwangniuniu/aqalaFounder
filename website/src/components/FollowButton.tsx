"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { followUser, unfollowUser, subscribeToFollowStatus } from "@/lib/firebase/follows";
import { getUserProfile } from "@/lib/firebase/users";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function FollowButton({ targetUserId, size = "md", className = "" }: FollowButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Subscribe to follow status
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToFollowStatus(user.uid, targetUserId, (following) => {
      setIsFollowing(following);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, targetUserId]);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/auth/login?returnUrl=/user/${targetUserId}`);
      return;
    }

    if (actionLoading) return;

    setActionLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.uid, targetUserId);
      } else {
        // Get both users' data for the follow relationship
        const [currentProfile, targetProfile] = await Promise.all([
          getUserProfile(user.uid),
          getUserProfile(targetUserId),
        ]);

        await followUser(
          user.uid,
          targetUserId,
          {
            username: currentProfile?.username || null,
            displayName: currentProfile?.displayName || user.displayName,
            photoURL: currentProfile?.photoURL || user.photoURL,
          },
          {
            username: targetProfile?.username || null,
            displayName: targetProfile?.displayName || null,
            photoURL: targetProfile?.photoURL || null,
          }
        );
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    } finally {
      setActionLoading(false);
    }
  }, [user, targetUserId, isFollowing, actionLoading, router]);

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-1.5 text-sm",
    lg: "px-6 py-2 text-base",
  };

  if (loading) {
    return (
      <div className={`rounded-lg bg-white/10 h-full animate-pulse ${sizeClasses[size]} ${className}`}>
        <span className="opacity-0">Follow</span>
      </div>
    );
  }

  // Don't show button for own profile
  if (user?.uid === targetUserId) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      disabled={actionLoading}
      className={`
        rounded-lg font-medium transition-all h-full
        ${sizeClasses[size]}
        ${isFollowing
          ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400"
          : "bg-[#D4AF37] text-[#021a12] hover:bg-[#E8D5A3]"
        }
        ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {actionLoading ? (
        <svg className="animate-spin h-4 w-4 mx-auto" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : isFollowing ? (
        "Following"
      ) : (
        "Follow"
      )}
    </button>
  );
}
