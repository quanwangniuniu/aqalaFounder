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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex flex-wrap justify-center gap-4 py-2 text-sm text-center">
          {LEGAL.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/app#contact" className="text-gray-500 hover:text-white transition-colors">
            Contact
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-800">
          Copyright © {new Date().getFullYear()} Aqala. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
