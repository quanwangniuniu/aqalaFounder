"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isListen = pathname === "/listen";
  const isDonate = pathname === "/donate";
  const padTop = isHome ? "" : "pt-[20px]";
  
  // Homepage gets full-width treatment
  if (isHome) {
    return (
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    );
  }

  // Listen page gets full-width dark treatment
  if (isListen) {
    return (
      <main className={`flex-1 flex flex-col bg-[#032117] ${padTop}`}>
        {children}
      </main>
    );
  }

  // Donate page gets full-width treatment (has its own background)
  if (isDonate) {
    return (
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    );
  }

  return (
    <main className={`flex-1 flex justify-center bg-[#032117] ${padTop}`}>
      <div className="w-full max-w-[554px] bg-[#032117] min-h-full flex flex-col">
        {children}
      </div>
    </main>
  );
}


