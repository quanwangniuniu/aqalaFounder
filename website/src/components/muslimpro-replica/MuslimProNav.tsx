"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import AvatarSkeleton from "@/components/AvatarSkeleton";

const SCROLL_HIDE_AFTER = 900;

const NAV_LINKS = [
  { label: "About Us", href: "/app/about" },
  {
    label: "Features",
    href: "/app/features",
    dropdown: [
      { label: "Core Features", href: "/app/features" },
      { label: "Islamic Calendar", href: "/app/islamic-calendar" },
      { label: "Listen", href: "/listen" },
      { label: "Shared Listening", href: "/rooms" },
    ],
  },
  {
    label: "Blog",
    href: "/app/blog",
    dropdown: [
      { label: "All Articles", href: "/app/blog" },
      { label: "Ramadan 2026 Guide", href: "/app/ramadan-fasting-times-iftar-dua-ramadan-greetings" },
      { label: "Deen", href: "/app/category/deen" },
      { label: "Lifestyle", href: "/app/category/lifestyle" },
      { label: "Quran", href: "/app/category/quran" },
      { label: "Shared Listening", href: "/app/qalbox" },
    ],
  },
  {
    label: "Premium",
    href: "/app/premium",
    dropdown: [
      { label: "Unlock premium", href: "/app/premium" },
      { label: "Gift Premium", href: "/app/premium/gift" },
      { label: "Redeem Premium", href: "/app/premium/redeem" },
    ],
  },
  { label: "Support Us", href: "/donate" },
];

const DROPDOWN_FADE_MS = 200;

export default function MuslimProNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [closingDropdown, setClosingDropdown] = useState<string | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);
  const closingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeDropdown = useCallback(() => {
    if (openDropdown) {
      setClosingDropdown(openDropdown);
      setOpenDropdown(null);
      closingTimeoutRef.current = setTimeout(() => {
        setClosingDropdown(null);
        closingTimeoutRef.current = null;
      }, DROPDOWN_FADE_MS);
    }
  }, [openDropdown]);

  const toggleDropdown = useCallback((label: string) => {
    if (closingTimeoutRef.current) {
      clearTimeout(closingTimeoutRef.current);
      closingTimeoutRef.current = null;
    }
    setClosingDropdown(null);
    if (openDropdown === label) {
      closeDropdown();
    } else {
      setOpenDropdown(label);
    }
  }, [closeDropdown, openDropdown]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdown, closeDropdown]);

  useEffect(() => () => {
    if (closingTimeoutRef.current) clearTimeout(closingTimeoutRef.current);
  }, []);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      const last = lastScrollYRef.current;
      setNavVisible(y <= SCROLL_HIDE_AFTER || y < last);
      lastScrollYRef.current = y;
    }
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeDropdown = NAV_LINKS.find((l) => l.dropdown && openDropdown === l.label);
  const dropdownToShow = activeDropdown ?? NAV_LINKS.find((l) => l.dropdown && closingDropdown === l.label);

  return (
    <div ref={navRef} className={`relative sticky top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${navVisible ? "translate-y-0" : "-translate-y-full"}`}>
      {/* Main nav bar - seamless with banner, no white gap */}
      <nav className="bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-8">
            <Link href="/app" className="flex items-center shrink-0 mr-8 md:mr-12" aria-label="Back to Aqala home">
              <img src="/aqala-logo.png" alt="Aqala" className="h-8 md:h-9 w-auto object-contain invert" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-6 lg:gap-8 min-w-0">
              {NAV_LINKS.map((link) =>
                link.dropdown ? (
                  <button
                    key={link.href}
                    onClick={() => toggleDropdown(link.label)}
                    className={`flex items-center gap-1 font-medium transition-colors px-2 py-1 rounded ${
                      openDropdown === link.label
                        ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                        : pathname?.startsWith(link.href)
                          ? "text-white"
                          : "text-white/90 hover:text-white"
                    }`}
                  >
                    {link.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-medium transition-colors ${pathname === link.href ? "text-white" : "text-white/90 hover:text-white"}`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="flex items-center gap-4 ml-auto shrink-0">
                {loading ? (
                  <AvatarSkeleton className="h-10 w-10" />
                ) : user ? (
                  <UserAvatar key={`${user.uid}-${user.photoURL ?? ""}`} className="w-10 h-10" priority />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/login?returnUrl=/app"
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register?returnUrl=/app"
                      className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white/90 hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Floating dropdown - separate banner, overlays content (no nav expansion) */}
      {dropdownToShow && (
        <div
          key={dropdownToShow.label}
          className={`absolute top-full left-0 right-0 z-50 shadow-lg transition-opacity duration-200 ease-out ${
            activeDropdown ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-[#032117]/95 border-b border-white/10 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                {(dropdownToShow.dropdown ?? []).map((d) => (
                  <Link
                    key={d.label}
                    href={d.href}
                    className="text-white/90 font-medium hover:text-[#D4AF37] transition-colors"
                    onClick={closeDropdown}
                  >
                    {d.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
          <div className="md:hidden bg-[#032117] py-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col gap-2 mb-4">
              {loading ? (
                <div className="flex justify-center py-2">
                  <AvatarSkeleton className="h-10 w-10" />
                </div>
              ) : user ? (
                <Link
                  href={`/user/${user.uid}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white font-semibold text-center hover:bg-white/10 hover:border-white/20 transition-colors"
                >
                  Profile
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login?returnUrl=/app"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white font-semibold text-center hover:bg-white/10 hover:border-white/20 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register?returnUrl=/app"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold text-center hover:bg-[#E8D5A3] transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="block py-2 text-white/90 font-medium" onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </Link>
                  {link.dropdown?.map((d) => (
                    <Link key={d.label} href={d.href} className="block py-2 pl-4 text-white/80 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      {d.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
