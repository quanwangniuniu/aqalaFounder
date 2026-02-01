"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t, isRTL } = useLanguage();
  const pathname = usePathname();

  // Hide footer on listen page - it has its own controls
  if (pathname === "/listen") {
    return null;
  }

  return (
    <footer className="bg-[#032117] mt-auto relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      
      <div className="relative mx-auto max-w-[600px] px-6 py-5">
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/aqala.foundation?igsh=MXJ6cGNvcXdoazJ3aw=="
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-[#D4AF37] hover:bg-white/5 transition-all duration-200"
            aria-label="Follow us on Instagram"
          >
            <svg
              className="w-[18px] h-[18px] transition-transform group-hover:scale-110"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t("footer.instagram")}</span>
          </a>

          {/* Donate Link */}
          <Link
            href="/donate"
            className="group flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-[#D4AF37] hover:bg-white/5 transition-all duration-200"
          >
            <svg
              className="w-[18px] h-[18px] transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t("footer.donate")}</span>
          </Link>

          {/* Reviews Link */}
          <Link
            href="/reviews"
            className="group flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-[#D4AF37] hover:bg-white/5 transition-all duration-200"
          >
            <svg
              className="w-[18px] h-[18px] transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t("footer.reviews")}</span>
          </Link>

          {/* Subscribe Link */}
          <Link
            href="/subscription"
            className="group flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-[#D4AF37] hover:bg-white/5 transition-all duration-200"
          >
            <svg
              className="w-[18px] h-[18px] transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Subscribe</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
