"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getUserInitials } from "@/utils/userDisplay";
import { SubscriptionPlan } from "@/types/subscription";

interface UserAvatarProps {
  className?: string;
}

const PLAN_BADGE_COLORS: Record<SubscriptionPlan, string> = {
  free: "bg-gray-400",
  premium: "bg-[#10B981]",
  business: "bg-[#059669]",
};

const PLAN_BADGE_LABELS: Record<SubscriptionPlan, string> = {
  free: "Free",
  premium: "Premium",
  business: "Business",
};

export default function UserAvatar({ className = "" }: UserAvatarProps) {
  const { user, signOut } = useAuth();
  const { plan } = useSubscription();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#10B981] text-white font-medium text-sm hover:bg-[#059669] transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2"
        aria-label="User menu"
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
        {/* Subscription badge */}
        <span
          className={`absolute -bottom-1 -right-1 w-4 h-4 ${PLAN_BADGE_COLORS[plan]} rounded-full border-2 border-white flex items-center justify-center`}
          title={PLAN_BADGE_LABELS[plan]}
        >
          <span className="sr-only">{PLAN_BADGE_LABELS[plan]}</span>
        </span>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">{plan} Plan</p>
          </div>
          <Link
            href="/subscription"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Subscription Plans
          </Link>
          {plan !== "free" && (
            <Link
              href="/subscription/manage"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Subscription
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
