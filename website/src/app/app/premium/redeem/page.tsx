import { Suspense } from "react";
import PremiumRedeemContent from "./PremiumRedeemContent";

export default function PremiumRedeemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-56px)] bg-[#032117] flex items-center justify-center text-white/50 text-sm">
          Loading…
        </div>
      }
    >
      <PremiumRedeemContent />
    </Suspense>
  );
}
