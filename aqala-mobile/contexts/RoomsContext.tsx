import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Room,
  clearTranslator,
  createRoom as createRoomApi,
  deleteRoom as deleteRoomApi,
  joinRoom,
  setTranslator,
  subscribeRooms,
  claimLeadReciter,
  validateAndCleanTranslator,
  getOrCreatePartnerRoom,
  startPartnerBroadcast,
  stopPartnerBroadcast,
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
  getOrCreatePartnerRoom: (partnerName: string, mosqueId: string) => Promise<Room>;
  startPartnerBroadcast: (roomId: string) => Promise<void>;
  stopPartnerBroadcast: (roomId: string) => Promise<void>;
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
    setLoading(true);
    const unsubscribe = subscribeRooms(
      (incoming) => {
        setRooms(incoming);
        setLoading(false);
        setError(null);
      },
      (err) => {
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
  }, []);

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
        await createRoomApi({
          name,
          ownerId: u.uid,
          ownerName: u.displayName || u.email || "Anonymous",
        });
      },
      async deleteRoom(roomId: string) {
        const u = requireUser();
        setError(null);
        await deleteRoomApi(roomId, u.uid);
      },
      async joinRoom(roomId: string, asTranslator = false) {
        const u = requireUser();
        setError(null);
        await joinRoom(roomId, u.uid, asTranslator, u.email);
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
      async getOrCreatePartnerRoom(partnerName: string, mosqueId: string) {
        const u = requireUser();
        setError(null);
        return await getOrCreatePartnerRoom(u.uid, partnerName, mosqueId);
      },
      async startPartnerBroadcast(roomId: string) {
        const u = requireUser();
        setError(null);
        await startPartnerBroadcast(roomId, u.uid);
      },
      async stopPartnerBroadcast(roomId: string) {
        const u = requireUser();
        setError(null);
        await stopPartnerBroadcast(roomId, u.uid);
      },
    }),
    [rooms, loading, error, user]
  );

  return <RoomsContext.Provider value={api}>{children}</RoomsContext.Provider>;
}
