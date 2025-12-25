"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // On landing page, hide header unless user is signed in (to show avatar)
  if (pathname === "/" && !user) return null;

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };

  const getInitials = (email: string | null) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
      <div className="mx-auto max-w-[554px] h-[68px] px-6 flex items-center justify-between bg-white">
        <Link href="/" className="flex items-center">
          <Image
            src="/aqala-logo.png"
            alt="Logo"
            width={100}
            height={100}
            priority
            className="bg-white rounded-md p-1"
          />
          <span className="sr-only">Home</span>
        </Link>

        {!loading && (
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="User menu"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || user.email || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-medium">
                      {getInitials(user.email)}
                    </div>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      <div className="py-2 px-4 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.displayName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 text-sm font-medium text-[#10B981] hover:text-[#059669] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-full transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}


