"use client";

import { useEffect, useState } from "react";
import { RoomMember, subscribeRoomMembers } from "@/lib/firebase/rooms";
import { useAuth } from "@/contexts/AuthContext";
import { getUserDisplayName, getUserInitials } from "@/utils/userDisplay";

interface MembersModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

export default function MembersModal({ open, onClose, roomId, roomName }: MembersModalProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !roomId || !user) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeRoomMembers(
      roomId,
      (incoming) => {
        setMembers(incoming);
        setLoading(false);
      },
      (err) => {
        // Ignore permission errors when user signs out (expected behavior)
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          setMembers([]);
          setLoading(false);
          return;
        }
        console.error("Error loading members:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [open, roomId, user]);


  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-hidden={false}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          aria-label="Close"
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-100"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">{roomName}</h2>
          <p className="text-sm text-zinc-600">{members.length} {members.length === 1 ? "member" : "members"}</p>
        </div>

        {/* Members list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-zinc-600 text-center py-4">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-4">No members yet</p>
          ) : (
            members.map((member) => {
              const isCurrentUser = member.userId === user?.uid;
              const isLeadReciter = member.role === "translator";
              return (
                <div
                  key={member.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isCurrentUser ? "bg-violet-50 border border-violet-200" : "bg-zinc-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#7D00D4] text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {getUserInitials(member.userId === user?.uid ? user : null, member.userId)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {member.userId === user?.uid ? "You" : getUserDisplayName(null, member.userId, member.email)}
                      </p>
                      {isLeadReciter && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-[#7D00D4] text-white rounded-full">
                          Lead Reciter
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {member.joinedAt
                        ? `Joined ${member.joinedAt.toLocaleDateString()}`
                        : "Member"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

