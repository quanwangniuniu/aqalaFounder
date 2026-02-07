"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChatMessage, 
  sendChatMessage, 
  subscribeChatMessages 
} from "@/lib/firebase/rooms";
import { subscribeToSubscription } from "@/lib/firebase/subscriptions";
import Image from "next/image";
import Link from "next/link";

interface LiveChatProps {
  roomId: string;
  isPartnerRoom?: boolean;
  ownerId?: string;
  donationsEnabled?: boolean;
  className?: string;
  hideHeader?: boolean;
}

export default function LiveChat({ 
  roomId, 
  isPartnerRoom = false,
  ownerId,
  donationsEnabled = true,
  className = "",
  hideHeader = false,
}: LiveChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Subscribe to chat messages
  useEffect(() => {
    const unsubscribe = subscribeChatMessages(
      roomId,
      (msgs) => {
        setMessages(msgs);
      },
      (err) => {
        // Silently handle permission errors - unauthenticated users may not have access
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          return;
        }
        console.error("Chat subscription error:", err);
      }
    );
    return () => unsubscribe();
  }, [roomId]);

  // Subscribe to user's subscription status
  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      return;
    }

    const unsubscribe = subscribeToSubscription(user.uid, (sub) => {
      setIsPremium(sub?.plan === "premium" && sub?.status === "active");
    });

    return () => unsubscribe();
  }, [user]);

  // Auto-scroll to bottom when new messages arrive (if user is near bottom)
  useEffect(() => {
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  // Track scroll position to determine if user is near bottom
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100);
    }
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    if (!user || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      // Prefer username, fallback to displayName, then email
      const displayName = user.username 
        ? `@${user.username}` 
        : user.displayName || user.email?.split("@")[0] || "Anonymous";
      
      await sendChatMessage(
        roomId,
        user.uid,
        displayName,
        newMessage.trim(),
        {
          userPhoto: user.photoURL || undefined,
          isAdmin: user.admin || false,
          isPartner: user.uid === ownerId && isPartnerRoom,
          isPremium,
        }
      );
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  }, [user, newMessage, isSending, roomId, ownerId, isPartnerRoom]);

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Send donation message
  const handleDonation = useCallback(async (amount: number) => {
    if (!user || isSending) return;

    setIsSending(true);
    try {
      // Prefer username, fallback to displayName, then email
      const displayName = user.username 
        ? `@${user.username}` 
        : user.displayName || user.email?.split("@")[0] || "Anonymous";
      
      await sendChatMessage(
        roomId,
        user.uid,
        displayName,
        `Donated $${amount}! 🎉`,
        {
          userPhoto: user.photoURL || undefined,
          isPartner: false,
          isDonation: true,
          donationAmount: amount,
        }
      );
      setShowDonation(false);
      setDonationAmount(null);
    } catch (err) {
      console.error("Failed to send donation:", err);
    } finally {
      setIsSending(false);
    }
  }, [user, isSending, roomId]);

  // Format time
  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate avatar colors based on userId
  const getAvatarColor = useMemo(() => {
    const colors = [
      "from-rose-500 to-pink-500",
      "from-violet-500 to-purple-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
      "from-red-500 to-rose-500",
      "from-indigo-500 to-blue-500",
    ];
    return (userId: string) => {
      const hash = userId.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };
  }, []);

  return (
    <div className={`flex flex-col bg-[#0a0d10] ${className}`}>
      {/* Chat Header */}
      {!hideHeader && (
        <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-sm font-medium text-white/70">Live Chat</span>
            <span className="text-xs text-white/30">({messages.length})</span>
          </div>
          {donationsEnabled && user && (
            <button
              onClick={() => setShowDonation(!showDonation)}
              className={`p-1.5 rounded-lg transition-colors ${
                showDonation 
                  ? "bg-[#D4AF37]/20 text-[#D4AF37]" 
                  : "hover:bg-white/5 text-white/40 hover:text-white/60"
              }`}
              title="Support the streamer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Donation Panel */}
      {showDonation && (
        <div className="flex-shrink-0 p-4 border-b border-white/5 bg-gradient-to-r from-[#D4AF37]/5 to-transparent animate-in slide-in-from-top-2 duration-200">
          <p className="text-xs text-white/50 mb-3">Support this stream</p>
          <div className="flex gap-2 flex-wrap">
            {[5, 10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => handleDonation(amount)}
                disabled={isSending}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  donationAmount === amount
                    ? "bg-[#D4AF37] text-[#0a1f16]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">No messages yet</p>
            <p className="text-white/20 text-xs mt-1">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`group animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                msg.isDonation ? "bg-gradient-to-r from-[#D4AF37]/10 to-transparent p-2 -mx-2 rounded-lg" : ""
              }`}
            >
              <div className="flex gap-2">
                {/* Avatar - Clickable */}
                <Link 
                  href={`/user/${msg.userId}`}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {msg.userPhoto ? (
                    <Image
                      src={msg.userPhoto}
                      alt={msg.userName}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(msg.userId)} flex items-center justify-center text-white text-xs font-medium`}>
                      {msg.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <Link 
                      href={`/user/${msg.userId}`}
                      className={`text-sm font-medium truncate hover:underline ${
                        msg.isAdmin
                          ? "text-rose-400"
                          : msg.isPartner 
                            ? "text-[#D4AF37]" 
                            : msg.isPremium
                              ? "text-amber-400"
                              : msg.isDonation 
                                ? "text-emerald-400"
                                : "text-white/70"
                      }`}
                    >
                      {msg.userName}
                    </Link>
                    {msg.isAdmin && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-400 flex items-center gap-0.5">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        ADMIN
                      </span>
                    )}
                    {msg.isPartner && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                        HOST
                      </span>
                    )}
                    {msg.isPremium && !msg.isAdmin && !msg.isPartner && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center gap-0.5 border border-amber-500/20">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                        </svg>
                        PRO
                      </span>
                    )}
                    {msg.isDonation && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400">
                        ${msg.donationAmount}
                      </span>
                    )}
                    <span className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm break-words ${
                    msg.isDonation ? "text-white/80" : "text-white/60"
                  }`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* New messages indicator */}
      {!isNearBottom && messages.length > 0 && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#D4AF37] text-[#0a1f16] rounded-full text-xs font-medium shadow-lg hover:bg-[#E0BC42] transition-colors"
        >
          ↓ New messages
        </button>
      )}

      {/* Input */}
      {user ? (
        <div className="flex-shrink-0 p-3 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              maxLength={500}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !newMessage.trim()}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E0BC42] disabled:opacity-50 disabled:hover:bg-[#D4AF37] text-[#0a1f16] rounded-xl font-medium text-sm transition-colors"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 p-4 border-t border-white/5 text-center">
          <a
            href="/auth/login"
            className="text-sm text-[#D4AF37] hover:text-[#E0BC42] transition-colors"
          >
            Sign in to chat →
          </a>
        </div>
      )}
    </div>
  );
}
