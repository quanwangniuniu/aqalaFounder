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
  const isAuthRoute = pathname?.startsWith("/auth");
  const isListen = pathname === "/listen";
  const isDonate = pathname === "/donate";
  const isFullWidth =
    isHome ||
    isLanding ||
    isAppSection ||
    isAuthRoute ||
    isListen ||
    isDonate ||
    pathname?.startsWith("/rooms") ||
    pathname?.startsWith("/admin");
  const padTop = isHome || isLanding || isAppSection || isAuthRoute ? "" : "pt-[20px]";
  
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
    <main className={`relative z-10 flex-1 flex justify-center px-4 sm:px-6 lg:px-8 ${padTop}`}>
      <div className="w-full max-w-[554px] md:max-w-3xl lg:max-w-5xl min-h-full flex flex-col">
        {children}
      </div>
    </main>
  );
}


