"use client";

import Link from "next/link";

/**
 * Manage Preferences bar - matches app.muslimpro.com top bar
 * Shown on app-like pages (prayer-times, app)
 */
export default function MuslimProManagePreferences() {
  return (
    <div className="sticky top-0 z-[55] bg-gray-100 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <Link
          href="/privacy"
          className="text-sm font-medium text-gray-700 hover:text-[#00a651] transition-colors"
        >
          Manage Preferences
        </Link>
      </div>
    </div>
  );
}
