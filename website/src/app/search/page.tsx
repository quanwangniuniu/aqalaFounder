"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import FollowButton from "@/components/FollowButton";
import { searchUsers, SearchedUser } from "@/lib/firebase/users";

export default function SearchPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchedUser[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("aqala_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // Search function with debounce
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const users = await searchUsers(searchQuery.trim(), 20);
      setResults(users);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Save to recent searches
  const saveToRecent = (user: SearchedUser) => {
    const updated = [user, ...recentSearches.filter(u => u.uid !== user.uid)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("aqala_recent_searches", JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("aqala_recent_searches");
  };

  return (
    <div className="min-h-screen text-white">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6M9 9l6 6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">No users found for "{query}"</p>
                <p className="text-white/30 text-xs mt-1">Try searching by username or name</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-white/40 mb-3">{results.length} result{results.length !== 1 ? "s" : ""}</p>
                {results.map((user) => (
                  <UserSearchItem 
                    key={user.uid} 
                    user={user} 
                    currentUserId={currentUser?.uid}
                    onSelect={() => saveToRecent(user)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Recent Searches (when not searching) */}
        {!loading && !searched && recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/70">Recent</p>
              <button
                onClick={clearRecent}
                className="text-xs text-[#D4AF37] hover:text-[#E8D5A3] transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((user) => (
                <UserSearchItem 
                  key={user.uid} 
                  user={user} 
                  currentUserId={currentUser?.uid}
                  onSelect={() => saveToRecent(user)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State (no recent, not searching) */}
        {!loading && !searched && recentSearches.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <p className="text-white/50 text-sm">Search for users</p>
            <p className="text-white/30 text-xs mt-1">Find friends by username or name</p>
          </div>
        )}
      </div>
    </div>
  );
}

// User search item component
function UserSearchItem({ 
  user, 
  currentUserId,
  onSelect 
}: { 
  user: SearchedUser; 
  currentUserId?: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={`/user/${user.uid}`}
      onClick={onSelect}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
    >
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.username || user.displayName || "User"}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-semibold text-lg">
          {(user.username || user.displayName || "U")[0].toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-white text-sm truncate">
            {user.displayName || user.username || "User"}
          </p>
          {user.admin && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-400 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin
            </span>
          )}
          {user.partner && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
              Partner
            </span>
          )}
          {user.isPremium && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center gap-0.5 border border-amber-500/20">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
              Pro
            </span>
          )}
        </div>
        {user.username && (
          <p className="text-xs text-white/50 truncate">@{user.username}</p>
        )}
        {user.bio && (
          <p className="text-xs text-white/40 truncate mt-0.5">{user.bio}</p>
        )}
      </div>
      {currentUserId && currentUserId !== user.uid && (
        <div onClick={(e) => e.preventDefault()}>
          <FollowButton targetUserId={user.uid} size="sm" />
        </div>
      )}
    </Link>
  );
}
