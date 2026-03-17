"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * App entry redirect
 * Redirects to prayer-times (the main app-like experience)
 */
export default function MuslimProAppPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/prayer-times");
  }, [router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <p className="text-gray-500">Redirecting to Prayer Times…</p>
    </div>
  );
}
