"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "@/components/UserAvatar";

export default function Header() {
  const pathname = usePathname();
  const { user, partnerInfo } = useAuth();

  // Hide header on landing page
  if (pathname === "/") return null;

  return (
    <header className="relative z-50">
      <div className="mx-auto max-w-[554px] h-[60px] px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/aqala-logo.png"
            alt="Logo"
            width={72}
            height={72}
            priority
            className="invert"
          />
          <span className="sr-only">Home</span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Search */}
          <Link
            href="/search"
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Search users"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>

          {/* Admin Portal link for partners */}
          {user && partnerInfo?.isPartner && pathname !== "/admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              Broadcast
            </Link>
          )}

          {/* Profile */}
          {user && <UserAvatar />}
        </div>
      </div>
    </header>
  );
}
