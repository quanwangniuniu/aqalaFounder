"use client";

import Link from "next/link";

const LEGAL = [
  { label: "Help Center", href: "/support" },
  { label: "Cookies Policy", href: "/privacy" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];

export default function MuslimProFooter() {
  return (
    <footer className="bg-[#021a12] text-gray-300 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Brand + tagline */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/aqala-logo.png" alt="Aqala" className="w-10 h-10 rounded-xl object-contain invert" />
          </div>
          <p className="text-gray-400 text-sm max-w-md">
            Aqala connects people through comprehension. Real-time translation and multilingual communication for Islamic content — Qur&apos;an, khutbahs, and lectures.
          </p>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap justify-center gap-4 py-6 text-sm text-center">
          {LEGAL.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          Copyright © {new Date().getFullYear()} Aqala. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
