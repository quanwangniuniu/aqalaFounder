"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRooms } from "@/contexts/RoomsContext";
import { subscribeRoomMembers, RoomMember } from "@/lib/firebase/rooms";
import MembersModal from "@/components/MembersModal";
import { getUserDisplayName, getUserInitials } from "@/utils/userDisplay";

export default function RoomsPage() {
  const { user } = useAuth();
  const { rooms, loading, error, createRoom, deleteRoom } = useRooms();
  const [roomName, setRoomName] = useState("");
  const [busyRoom, setBusyRoom] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [roomMembers, setRoomMembers] = useState<Record<string, RoomMember[]>>({});
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const sortedRooms = useMemo(
    () => rooms.slice().sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)),
    [rooms]
  );

  // Subscribe to members for each room (only when user is signed in)
  useEffect(() => {
    if (!user || rooms.length === 0) {
      setRoomMembers({});
      return;
    }

    const unsubscribes: (() => void)[] = [];
    rooms.forEach((room) => {
      const unsubscribe = subscribeRoomMembers(
        room.id,
        (members) => {
          setRoomMembers((prev) => ({ ...prev, [room.id]: members }));
        },
        (err) => {
          // Ignore permission errors when user signs out (expected behavior)
          if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
            return;
          }
          console.error(`Error loading members for room ${room.id}:`, err);
        }
      );
      unsubscribes.push(unsubscribe);
    });
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [rooms, user]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setLocalError("Please sign in to create a mosque");
      return;
    }
    if (!roomName.trim()) {
      setLocalError("Enter a mosque name");
      return;
    }
    setLocalError(null);
    setCreating(true);
    try {
      await createRoom(roomName.trim());
      setRoomName("");
    } catch (err: any) {
      setLocalError(err?.message || "Failed to create mosque");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (roomId: string) => {
    setBusyRoom(roomId);
    setLocalError(null);
    try {
      await deleteRoom(roomId);
    } catch (err: any) {
      setLocalError(err?.message || "Failed to delete mosque");
    } finally {
      setBusyRoom(null);
    }
  };

  const handleShowMembers = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedRoomId(roomId);
  };

  return (
    <div className="px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mosques</h1>
          <p className="text-sm text-zinc-600">
            {user ? "Create a mosque or join an existing one." : "Browse available mosques. Sign in to create or join mosques."}
          </p>
        </div>
        <Link href="/" className="text-[#10B981] font-medium hover:underline">
          Back home
        </Link>
      </div>

      {localError && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{localError}</div>
      )}
      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {user && (
        <form onSubmit={handleCreate} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Mosque name</label>
          <div className="flex gap-3">
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="My Mosque"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none"
              disabled={creating}
            />
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-full bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2 font-medium disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      {!user && (
        <div className="text-center py-6 space-y-3 bg-zinc-50 rounded-lg border border-zinc-200">
          <p className="text-sm text-zinc-600">Sign in to create mosques and become a lead reciter.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2 font-medium text-sm"
          >
            Sign In
          </Link>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available mosques</h2>
        {loading ? (
          <p className="text-sm text-zinc-600">Loading mosques...</p>
        ) : sortedRooms.length === 0 ? (
          <p className="text-sm text-zinc-600">No mosques yet. Create one to start.</p>
        ) : (
          <div className="space-y-3">
            {sortedRooms.map((room) => {
              const isOwner = room.ownerId === user?.uid;
              const isBusy = busyRoom === room.id;
              const members = roomMembers[room.id] || [];
              const displayMembers = members.slice(0, 3); // Show max 3 avatars
              const remainingCount = Math.max(0, members.length - 3);

              return (
                <div key={room.id} className="border border-zinc-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                  <Link
                    href={`/rooms/${room.id}`}
                    className="flex-1 min-w-0 hover:bg-zinc-50 rounded-md px-2 py-1 -mx-2 transition-colors"
                  >
                    <p className="font-medium truncate">{room.name}</p>
                    <p className="text-xs text-zinc-500">
                      {user ? (
                        <>
                          Members: {room.memberCount} • Lead reciter: {room.activeTranslatorId ? (() => {
                            const translatorMember = roomMembers[room.id]?.find((m) => m.userId === room.activeTranslatorId);
                            return getUserDisplayName(null, room.activeTranslatorId, translatorMember?.email);
                          })() : "None"}
                        </>
                      ) : (
                        <>
                          {room.activeTranslatorId ? "Live translation available" : "No active translation"}
                        </>
                      )}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3">
                    {/* Overlapping avatars - only show for authenticated users */}
                    {user && members.length > 0 && (
                      <button
                        onClick={(e) => handleShowMembers(e, room.id)}
                        className="flex items-center -space-x-2 hover:space-x-1 transition-all cursor-pointer"
                        title={`${members.length} members`}
                      >
                        {displayMembers.map((member, idx) => (
                          <div
                            key={member.userId}
                            className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs font-medium border-2 border-white flex-shrink-0"
                            style={{ zIndex: 10 - idx }}
                          >
                            {getUserInitials(null, member.userId)}
                          </div>
                        ))}
                        {remainingCount > 0 && (
                          <div
                            className="w-8 h-8 rounded-full bg-zinc-400 text-white flex items-center justify-center text-xs font-medium border-2 border-white flex-shrink-0"
                            style={{ zIndex: 0 }}
                          >
                            +{remainingCount}
                          </div>
                        )}
                      </button>
                    )}
                    {user && isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDelete(room.id);
                        }}
                        disabled={isBusy}
                        className="px-3 py-1.5 text-sm rounded-full border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Members Modal - only show for authenticated users */}
      {user && selectedRoomId && (
        <MembersModal
          open={!!selectedRoomId}
          onClose={() => setSelectedRoomId(null)}
          roomId={selectedRoomId}
          roomName={rooms.find((r) => r.id === selectedRoomId)?.name || "Mosque"}
        />
      )}
    </div>
  );
}

