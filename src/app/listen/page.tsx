"use client";

import ClientApp from "@/app/client-app";

export default function ListenPage() {
  return (
    <div className="fixed inset-0 top-[68px] bg-[#1a1f2e] flex flex-col">
      <ClientApp autoStart={true} />
    </div>
  );
}
