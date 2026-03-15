"use client";

import LandingPage from "@/components/landing";
import AppHome from "@/components/AppHome";

/**
 * Unified homepage at "/" - no /landing suffix.
 * - Desktop (md+): Landing page
 * - Mobile (sm): App home (original)
 * Same route, conditional rendering via CSS.
 */
export default function Page() {
  return (
    <>
      {/* Landing: visible on desktop (md and up) */}
      <div className="hidden md:block">
        <LandingPage />
      </div>
      {/* App home: visible on mobile (below md) */}
      <div className="md:hidden">
        <AppHome />
      </div>
    </>
  );
}
