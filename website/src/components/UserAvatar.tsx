"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getUserInitials } from "@/utils/userDisplay";
import AvatarSkeleton from "@/components/AvatarSkeleton";

interface UserAvatarProps {
  className?: string;
  /** Prefer true in headers so Next.js loads the image with high priority. */
  priority?: boolean;
}

export default function UserAvatar({ className = "", priority = false }: UserAvatarProps) {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!user) {
    return null;
  }

  const displayName = user.username
    ? `@${user.username}`
    : user.displayName || user.email?.split("@")[0] || "User";
  const photoURL = user.photoURL ?? undefined;
  const showImage = Boolean(photoURL && !imageError);
  // Production avatars are almost always absolute URLs (Google, Apple, Cloudinary, etc.).
  // next/image optimization proxies through the app and adds latency; 40px avatars don't need it.
  const isRemoteAvatar = Boolean(photoURL?.startsWith("http://") || photoURL?.startsWith("https://"));

  return (
    <Link
      href={`/user/${user.uid}`}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#032117] overflow-hidden ${className}`}
      aria-label="View profile"
    >
      {showImage && photoURL ? (
        <>
          {!imageLoaded && (
            <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full">
              <AvatarSkeleton className="h-full w-full min-h-10 min-w-10" />
            </span>
          )}
          <Image
            src={photoURL}
            alt={displayName}
            width={40}
            height={40}
            priority={priority}
            unoptimized={isRemoteAvatar}
            sizes="40px"
            className={`relative z-[1] h-full w-full rounded-full object-cover transition-opacity duration-200 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
          />
        </>
      ) : (
        getUserInitials(user)
      )}
      {isPremium && (
        <span
          className="absolute -bottom-0.5 -right-0.5 z-[2] w-4 h-4 bg-[#D4AF37] rounded-full border-2 border-[#032117] flex items-center justify-center"
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
