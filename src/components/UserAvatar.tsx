"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getUserInitials } from "@/utils/userDisplay";

interface UserAvatarProps {
  className?: string;
}

export default function UserAvatar({ className = "" }: UserAvatarProps) {
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  if (!user) {
    return null;
  }

  return (
    <Link
      href="/account/settings"
      className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#032117] ${className}`}
      aria-label="Account settings"
    >
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || user.email || "User"}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getUserInitials(user)
      )}
      {/* Premium badge */}
      {isPremium && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#D4AF37] rounded-full border-2 border-[#032117] flex items-center justify-center"
          title="Premium"
        >
          <svg className="w-2 h-2 text-[#032117]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </span>
      )}
    </Link>
  );
}
