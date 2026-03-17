"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Giving redirects to the main Aqala donate page.
 * One donation page only — no separate giving categories.
 */
export default function GivingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/donate");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-white/60">Redirecting to Support Aqala…</p>
    </div>
  );
}
