"use client";

import { useState, useEffect, useCallback } from "react";
import { Room } from "@/lib/firebase/rooms";
import { useRooms } from "@/contexts/RoomsContext";

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  onSaved?: () => void;
}

export default function EditRoomModal({ isOpen, onClose, room, onSaved }: EditRoomModalProps) {
  const { updateRoom } = useRooms();
  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description || "");
  const [chatEnabled, setChatEnabled] = useState(room.chatEnabled ?? true);
  const [donationsEnabled, setDonationsEnabled] = useState(room.donationsEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(room.name);
      setDescription(room.description || "");
      setChatEnabled(room.chatEnabled ?? true);
      setDonationsEnabled(room.donationsEnabled ?? true);
      setError("");
    }
  }, [isOpen, room]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError("Please enter a room name");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await updateRoom(room.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        chatEnabled,
        donationsEnabled,
      });
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update room";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }, [room.id, name, description, chatEnabled, donationsEnabled, updateRoom, onClose, onSaved]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      setError("");
      onClose();
    }
  }, [isSaving, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-b from-[#0a1f16] to-[#061510] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="relative px-6 pt-8 pb-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F0D78C] to-[#D4AF37]" />
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Edit Room</h2>
                <p className="text-sm text-white/50 mt-0.5">Update room details</p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Room Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Study Circle"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                maxLength={50}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Description <span className="text-white/30">(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this session about?"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all resize-none"
                maxLength={200}
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-white/70">Room Settings</p>
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Live Chat</p>
                    <p className="text-xs text-white/40">Viewers can chat with each other</p>
                  </div>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors ${chatEnabled ? "bg-[#D4AF37]" : "bg-white/20"}`}>
                  <input type="checkbox" checked={chatEnabled} onChange={(e) => setChatEnabled(e.target.checked)} className="sr-only" />
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${chatEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </div>
              </label>
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Donations</p>
                    <p className="text-xs text-white/40">Allow viewers to support you</p>
                  </div>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors ${donationsEnabled ? "bg-[#D4AF37]" : "bg-white/20"}`}>
                  <input type="checkbox" checked={donationsEnabled} onChange={(e) => setDonationsEnabled(e.target.checked)} className="sr-only" />
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${donationsEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </div>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="flex-1 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
