"use client";

import MuslimProGazaBanner from "./MuslimProGazaBanner";
import MuslimProNav from "./MuslimProNav";

export default function MuslimProShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MuslimProGazaBanner />
      <MuslimProNav />
      {children}
    </div>
  );
}
