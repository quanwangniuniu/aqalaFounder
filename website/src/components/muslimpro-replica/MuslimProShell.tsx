"use client";

import MuslimProGazaBanner from "./MuslimProGazaBanner";
import MuslimProNav from "./MuslimProNav";

export default function MuslimProShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Wrapper bg prevents white gap between banner and nav */}
      <div className="bg-[#0a5c3e]">
        <MuslimProGazaBanner />
        <MuslimProNav />
      </div>
      {children}
    </div>
  );
}
