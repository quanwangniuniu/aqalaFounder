"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";
import {
  getOrCreateConversation,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  Message,
} from "@/lib/firebase/messages";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const otherUserId = params.userId as string;

  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push(`/auth/login?returnUrl=/messages/${otherUserId}`);
    }
  }, [currentUser, authLoading, router, otherUserId]);

  // Load other user and create/get conversation
  useEffect(() => {
    if (!currentUser) return;

    const init = async () => {
      try {
        // Get other user's profile
        const profile = await getUserProfile(otherUserId);
        if (!profile) {
          router.push("/messages");
          return;
        }
        setOtherUser(profile);

        // Get current user's profile for conversation
        const currentProfile = await getUserProfile(currentUser.uid);

        // Get or create conversation
        const convId = await getOrCreateConversation(
          currentUser.uid,
          otherUserId,
          {
            username: currentProfile?.username || null,
            displayName: currentProfile?.displayName || currentUser.displayName,
            photoURL: currentProfile?.photoURL || currentUser.photoURL,
          },
          {
            username: profile.username,
            displayName: profile.displayName,
            photoURL: profile.photoURL,
          }
        );
        setConversationId(convId);
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [currentUser, otherUserId, router]);

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    // Mark messages as read
    markMessagesAsRead(conversationId, currentUser.uid);

    return () => unsubscribe();
  }, [conversationId, currentUser, scrollToBottom]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || !currentUser || sending) return;

    setSending(true);
    const text = newMessage.trim();
    setNewMessage("");

    try {
      await sendMessage(conversationId, currentUser.uid, text);
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(text); // Restore message on error
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || !otherUser) {
    return null;
  }

  const displayName = otherUser.displayName || otherUser.username || "User";

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <Link href={`/user/${otherUserId}`} className="flex items-center gap-3 flex-1 min-w-0">
            {otherUser.photoURL ? (
              <Image
                src={otherUser.photoURL}
                alt={displayName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-semibold">
                {displayName[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{displayName}</p>
              {otherUser.username && (
                <p className="text-xs text-white/50 truncate">@{otherUser.username}</p>
              )}
            </div>
          </Link>

          <button className="text-white/60 hover:text-white transition-colors p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
              {otherUser.photoURL ? (
                <Image
                  src={otherUser.photoURL}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-[#D4AF37]">{displayName[0].toUpperCase()}</span>
              )}
            </div>
            <p className="text-white font-semibold">{displayName}</p>
            {otherUser.username && (
              <p className="text-white/50 text-sm">@{otherUser.username}</p>
            )}
            <p className="text-white/40 text-xs mt-2">Start a conversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUser.uid;
              const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  {!isOwn && showAvatar && (
                    <div className="flex-shrink-0 w-7 h-7">
                      {otherUser.photoURL ? (
                        <Image
                          src={otherUser.photoURL}
                          alt={displayName}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-xs font-semibold">
                          {displayName[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  {!isOwn && !showAvatar && <div className="w-7" />}

                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-[#D4AF37] text-[#021a12] rounded-br-md"
                        : "bg-white/10 text-white rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-black/20 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2.5 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E8D5A3] transition-colors"
          >
            {sending ? (
              <svg className="animate-spin w-5 h-5 text-[#021a12]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#021a12" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
