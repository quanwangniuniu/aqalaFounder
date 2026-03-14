"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const SCROLL_HIDE_AFTER = 900;

const NAV_LINKS = [
  { label: "About Us", href: "/muslimpro-demo/about" },
  {
    label: "Features",
    href: "/muslimpro-demo/features",
    dropdown: [
      { label: "Core Features", href: "/muslimpro-demo/features" },
      { label: "Hijri Calendar", href: "/muslimpro-demo/islamic-calendar" },
      { label: "Ummah Pro", href: "/muslimpro-demo/ummah-pro" },
      { label: "Academy", href: "/muslimpro-demo/academy" },
    ],
  },
  { label: "Prayer Times", href: "/muslimpro-demo/prayer-times" },
  {
    label: "Blog",
    href: "/muslimpro-demo/blog",
    dropdown: [
      { label: "All Articles", href: "/muslimpro-demo/blog" },
      { label: "Ramadan 2026 Guide", href: "/muslimpro-demo/blog" },
      { label: "Deen", href: "/muslimpro-demo/blog" },
      { label: "Lifestyle", href: "/muslimpro-demo/blog" },
      { label: "Quran", href: "/muslimpro-demo/blog" },
      { label: "Qalbox", href: "/muslimpro-demo/blog" },
    ],
  },
  {
    label: "Premium",
    href: "/subscription",
    dropdown: [
      { label: "Get Premium", href: "/subscription" },
      { label: "Special Offer", href: "/muslimpro-demo/special-offer" },
      { label: "Gift Premium", href: "/subscription" },
      { label: "Redeem Premium", href: "/subscription" },
    ],
  },
  {
    label: "Giving",
    href: "/donate",
    dropdown: [
      { label: "Giving by Muslim Pro", href: "/muslimpro-demo/giving" },
      { label: "Urgent", href: "/donate" },
      { label: "Sadaqah", href: "/donate" },
      { label: "Zakat", href: "/donate" },
      { label: "Waqaf", href: "/donate" },
      { label: "Aqiqah", href: "/donate" },
      { label: "Become a Partner", href: "/donate" },
    ],
  },
];

export default function MuslimProNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdown]);

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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-[42px] left-0 right-0 z-50 bg-[#0a5c3e] transition-transform duration-300 ease-out ${
        navVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo - Muslim Pro / Qalbox from clone */}
          <Link
            href="/muslimpro-demo"
            className="flex items-center group"
          >
            <img
              src="/muslimpro-demo/logo.png"
              alt="Muslim Pro Logo"
              className="h-8 md:h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav - no App Store / Google Play */}
          <div ref={navRef} className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((link) =>
              link.dropdown ? (
                <div key={link.href} className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                    className={`flex items-center gap-1 font-medium transition-colors ${
                      pathname?.startsWith(link.href) ? "text-white" : "text-white/90 hover:text-white"
                    }`}
                  >
                    {link.label}
                    <svg className={`w-4 h-4 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === link.label && (
                    <div data-mp-dropdown className="absolute top-full left-0 mt-1 w-48 py-2 bg-[#0a5c3e] border border-white/10 rounded-lg">
                      {link.dropdown.map((d) => (
                        <Link
                          key={d.label}
                          href={d.href}
                          className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors ${
                    pathname === link.href ? "text-white" : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
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

        {/* Mobile menu - no App Store / Google Play */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
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
        )}
      </div>
    </nav>
  );
}
