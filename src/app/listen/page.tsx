"use client";

import ClientApp from "@/app/client-app";

export default function ListenPage() {
  return (
    <div className="fixed inset-0 top-[68px] flex flex-col">
      <ClientApp autoStart={true} />
    </div>
  );
}
