"use client";

import MuslimProNav from "./MuslimProNav";

export default function MuslimProShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#032117]">
      <div className="bg-[#032117] border-b border-white/10">
        <MuslimProNav />
      </div>
      {children}
    </div>
  );
}
