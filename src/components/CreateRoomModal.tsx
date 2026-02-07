"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createRoom, CreateRoomOptions } from "@/lib/firebase/rooms";
import { useRouter } from "next/navigation";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const { user, partnerInfo } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chatEnabled, setChatEnabled] = useState(true);
  const [donationsEnabled, setDonationsEnabled] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  
  const isPartner = partnerInfo?.isPartner ?? false;

  const handleCreate = useCallback(async () => {
    if (!user) return;
    if (!name.trim()) {
      setError("Please enter a room name");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const options: CreateRoomOptions = {
        name: name.trim(),
        description: description.trim() || undefined,
        ownerId: user.uid,
        ownerName: user.displayName || user.email || "Anonymous",
        ownerPhoto: user.photoURL || undefined,
        isPartner,
        chatEnabled,
        donationsEnabled,
      };

      const room = await createRoom(options);
      onClose();
      router.push(`/rooms/${room.id}`);
    } catch (err: any) {
      console.error("Failed to create room:", err);
      setError(err.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  }, [user, name, description, isPartner, chatEnabled, donationsEnabled, onClose, router]);

  const handleClose = useCallback(() => {
    if (!isCreating) {
      setName("");
      setDescription("");
      setError("");
      onClose();
    }
  }, [isCreating, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-b from-[#0a1f16] to-[#061510] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Header with gradient accent */}
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
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isPartner 
                  ? "bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20" 
                  : "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20"
              }`}>
                {isPartner ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                    <path d="M3 21h18" strokeLinecap="round" />
                    <path d="M5 21V7l7-4 7 4v14" />
                    <path d="M9 21v-6h6v6" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {isPartner ? "Create Official Room" : "Create Community Room"}
                </h2>
                <p className="text-sm text-white/50 mt-0.5">
                  {isPartner ? "Partner broadcast room" : "Start a translation session"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pb-6 space-y-5">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Room Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isPartner ? "e.g., Friday Khutbah" : "e.g., Study Circle"}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                maxLength={50}
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Description <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this session about?"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all resize-none"
                maxLength={200}
              />
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/70">Room Settings</p>
              
              {/* Chat toggle */}
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
                <div className={`relative w-11 h-6 rounded-full transition-colors ${chatEnabled ? 'bg-[#D4AF37]' : 'bg-white/20'}`}>
                  <input
                    type="checkbox"
                    checked={chatEnabled}
                    onChange={(e) => setChatEnabled(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${chatEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </div>
              </label>

              {/* Donations toggle */}
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
                <div className={`relative w-11 h-6 rounded-full transition-colors ${donationsEnabled ? 'bg-[#D4AF37]' : 'bg-white/20'}`}>
                  <input
                    type="checkbox"
                    checked={donationsEnabled}
                    onChange={(e) => setDonationsEnabled(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${donationsEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>

            {/* Error */}
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

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating || !name.trim()}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isPartner
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#C49B30] hover:from-[#E0BC42] hover:to-[#D4AF37] text-[#0a1f16]"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white"
                }`}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
