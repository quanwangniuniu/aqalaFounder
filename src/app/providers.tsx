"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { RoomsProvider } from "@/contexts/RoomsContext";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RoomsProvider>{children}</RoomsProvider>
    </AuthProvider>
  );
}

