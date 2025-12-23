"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const padTop = pathname === "/" ? "" : "pt-[68px]";
  return (
    <main className={`flex-1 flex justify-center ${padTop}`}>
      <div className="w-full max-w-[554px] bg-white min-h-full flex flex-col">
        {children}
      </div>
    </main>
  );
}


