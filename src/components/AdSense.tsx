"use client";

import { useEffect } from "react";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || "ca-pub-3882364799598893";

export default function AdSense() {
  useEffect(() => {
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return;

    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
}
