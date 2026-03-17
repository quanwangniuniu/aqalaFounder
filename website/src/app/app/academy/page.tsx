"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Academy redirects to Core Features.
 * Aqala does not have a separate Academy — learning happens via Listen and Blog.
 */
export default function AcademyRedirectPage() {
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
