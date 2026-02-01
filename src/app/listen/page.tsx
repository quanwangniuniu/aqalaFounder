"use client";

import ClientApp from "@/app/client-app";

export default function ListenPage() {
  return (
    <div className="fixed inset-0 top-[68px] flex flex-col bg-[#032117]">
      <ClientApp autoStart={true} />
    </div>
  );
}
