"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isLanding = pathname === "/landing";
  const isAppSection = pathname?.startsWith("/app");
  const isListen = pathname === "/listen";
  const isDonate = pathname === "/donate";
  const isFullWidth = isHome || isLanding || isAppSection || isListen || isDonate || pathname?.startsWith("/rooms") || pathname?.startsWith("/admin");
  const padTop = isHome || isLanding || isAppSection ? "" : "pt-[20px]";
  
  // Full-width pages (homepage, listen, donate, rooms, admin)
  if (isFullWidth) {
    return (
      <main className={`relative z-10 flex-1 flex flex-col ${padTop}`}>
        {children}
      </main>
    );
  }

  // Centered content pages
  return (
    <main className={`relative z-10 flex-1 flex justify-center ${padTop}`}>
      <div className="w-full max-w-[554px] min-h-full flex flex-col">
        {children}
      </div>
    </main>
  );
}


