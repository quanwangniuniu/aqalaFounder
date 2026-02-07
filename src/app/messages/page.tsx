"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToConversations, Conversation } from "@/lib/firebase/messages";

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?returnUrl=/messages");
    }
  }, [user, authLoading, router]);

  // Subscribe to conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.uid, (convos) => {
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 top-[68px] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Messages</h1>
          <button className="text-white/60 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversations List - scrollable */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
        {conversations.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-white/50 text-sm">
              When you message someone, it'll show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {conversations.map((conversation) => {
              const otherUserId = conversation.participants.find((p) => p !== user.uid);
              const otherUser = otherUserId ? conversation.participantInfo[otherUserId] : null;
              const unread = conversation.unreadCount[user.uid] || 0;
              const isLastSender = conversation.lastSenderId === user.uid;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${otherUserId}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  {/* Avatar */}
                  {otherUser?.photoURL ? (
                    <Image
                      src={otherUser.photoURL}
                      alt={otherUser.displayName || otherUser.username || "User"}
                      width={52}
                      height={52}
                      className="w-13 h-13 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-semibold">
                      {(otherUser?.username || otherUser?.displayName || "U")[0].toUpperCase()}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`font-semibold text-sm truncate ${unread > 0 ? "text-white" : "text-white/90"}`}>
                        {otherUser?.displayName || otherUser?.username || "User"}
                      </p>
                      <span className="text-xs text-white/40 flex-shrink-0">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${unread > 0 ? "text-white font-medium" : "text-white/50"}`}>
                      {isLastSender && "You: "}
                      {conversation.lastMessage || "Start a conversation"}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {unread > 0 && (
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#021a12]">{unread > 99 ? "99+" : unread}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
        {/* Safe area padding for notched devices */}
        <div className="pb-safe" />
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } else if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "now";
  }
}
