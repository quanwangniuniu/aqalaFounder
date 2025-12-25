"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Room,
  clearTranslator,
  createRoom,
  deleteRoom,
  joinRoom,
  setTranslator,
  subscribeRooms,
  claimLeadReciter,
  validateAndCleanTranslator,
} from "@/lib/firebase/rooms";
import { useAuth } from "./AuthContext";

type RoomsContextType = {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  createRoom: (name: string) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string, asTranslator?: boolean) => Promise<void>;
  claimTranslator: (roomId: string) => Promise<void>;
  claimLeadReciter: (roomId: string) => Promise<void>;
  validateAndCleanTranslator: (roomId: string) => Promise<boolean>;
  releaseTranslator: (roomId: string) => Promise<void>;
};

const RoomsContext = createContext<RoomsContextType | undefined>(undefined);

export const useRooms = () => {
  const ctx = useContext(RoomsContext);
  if (!ctx) {
    throw new Error("useRooms must be used within RoomsProvider");
  }
  return ctx;
};

export function RoomsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only subscribe to rooms when user is signed in
    if (!user) {
      setRooms([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeRooms(
      (incoming) => {
        setRooms(incoming);
        setLoading(false);
        setError(null);
      },
      (err) => {
        // Ignore permission errors when user signs out (expected behavior)
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          setRooms([]);
          setLoading(false);
          setError(null);
          return;
        }
        setError(err?.message || "Failed to load rooms");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const requireUser = () => {
    if (!user) {
      throw new Error("You must be signed in");
    }
    return user;
  };

  const api = useMemo<RoomsContextType>(
    () => ({
      rooms,
      loading,
      error,
      async createRoom(name: string) {
        const u = requireUser();
        setError(null);
        await createRoom(name, u.uid);
      },
      async deleteRoom(roomId: string) {
        const u = requireUser();
        setError(null);
        await deleteRoom(roomId, u.uid);
      },
      async joinRoom(roomId: string, asTranslator = false) {
        const u = requireUser();
        console.log(`[JOIN MOSQUE CONTEXT] Called - roomId: ${roomId}, userId: ${u.uid}, asTranslator: ${asTranslator}`);
        setError(null);
        await joinRoom(roomId, u.uid, asTranslator);
        console.log(`[JOIN MOSQUE CONTEXT] Completed - roomId: ${roomId}, userId: ${u.uid}`);
      },
      async claimTranslator(roomId: string) {
        const u = requireUser();
        setError(null);
        await setTranslator(roomId, u.uid);
      },
      async claimLeadReciter(roomId: string) {
        const u = requireUser();
        setError(null);
        await claimLeadReciter(roomId, u.uid);
      },
      async validateAndCleanTranslator(roomId: string) {
        setError(null);
        return await validateAndCleanTranslator(roomId);
      },
      async releaseTranslator(roomId: string) {
        const u = requireUser();
        setError(null);
        await clearTranslator(roomId, u.uid);
      },
    }),
    [rooms, loading, error, user]
  );

  return <RoomsContext.Provider value={api}>{children}</RoomsContext.Provider>;
}

