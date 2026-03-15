"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect /landing to / - unified homepage at root with no suffix.
 */
export default function LandingRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
