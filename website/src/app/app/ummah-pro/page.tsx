"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Ummah Pro redirects to Core Features.
 * Aqala community features are in Shared Listening (/rooms), not a separate social feed.
 */
export default function UmmahProRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/features");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-[#032117]">
      <p className="text-white/60">Redirecting…</p>
    </div>
  );
}
