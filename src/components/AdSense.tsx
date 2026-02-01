"use client";

import Script from "next/script";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || "ca-pub-3882364799598893";

export default function AdSense() {
  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
