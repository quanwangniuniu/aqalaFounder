"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUserProfile, UserProfile, getUserRoomHistory, RoomHistoryEntry } from "@/lib/firebase/users";
import { getTitleFromLevel, getXpProgress, formatListeningTime } from "@/lib/firebase/listenerStats";
import { subscribeToUserCounts, getFollowers, getFollowing, getSuggestedUsers, FollowUser } from "@/lib/firebase/follows";
import { blockUser, unblockUser, isUserBlocked, getBlockedUsers } from "@/lib/firebase/moderation";
import FollowButton from "@/components/FollowButton";
import ReportModal from "@/components/ReportModal";
import { useAuth } from "@/contexts/AuthContext";

type TabType = "history" | "followers" | "following" | "discover";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, signOut } = useAuth();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [counts, setCounts] = useState({ followerCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("history");
  
  // Tab data
  const [roomHistory, setRoomHistory] = useState<RoomHistoryEntry[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<FollowUser[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [shareCopied, setShareCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnProfile = currentUser?.uid === userId;

  const shareTitle = profile?.username ? `@${profile.username}` : profile?.displayName || "Profile";
  const shareText = profile?.displayName || profile?.username ? `Check out ${profile?.displayName || profile?.username} on Aqala` : "Check out this profile on Aqala";

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/user/${userId}` : "";
    if (!url) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile(userId);
        if (!data) {
          setNotFound(true);
        } else {
          setProfile(data);
          setCounts({
            followerCount: data.followerCount,
            followingCount: data.followingCount,
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Subscribe to count updates
    const unsubscribeCount = subscribeToUserCounts(userId, setCounts);
    
    return () => {
      unsubscribeCount();
    };
  }, [userId]);

  // Load tab data when tab changes
  useEffect(() => {
    if (!profile) return;

    const loadTabData = async () => {
      switch (activeTab) {
        case "history":
          if (roomHistory.length === 0 && !profile.privateHistory || isOwnProfile) {
            setHistoryLoading(true);
            try {
              const history = await getUserRoomHistory(userId);
              setRoomHistory(history);
            } catch (err) {
              console.error("Failed to load history:", err);
            } finally {
              setHistoryLoading(false);
            }
          }
          break;
        case "followers":
          if (followers.length === 0 && (!profile.privateFollowers || isOwnProfile)) {
            setFollowersLoading(true);
            try {
              const data = await getFollowers(userId);
              setFollowers(data);
            } catch (err) {
              console.error("Failed to load followers:", err);
            } finally {
              setFollowersLoading(false);
            }
          }
          break;
        case "following":
          if (following.length === 0) {
            setFollowingLoading(true);
            try {
              const data = await getFollowing(userId);
              setFollowing(data);
            } catch (err) {
              console.error("Failed to load following:", err);
            } finally {
              setFollowingLoading(false);
            }
          }
          break;
        case "discover":
          if (isOwnProfile && suggestedUsers.length === 0 && currentUser) {
            setSuggestedLoading(true);
            try {
              const data = await getSuggestedUsers(currentUser.uid);
              setSuggestedUsers(data);
            } catch (err) {
              console.error("Failed to load suggestions:", err);
            } finally {
              setSuggestedLoading(false);
            }
          }
          break;
      }
    };

    loadTabData();
  }, [activeTab, profile, userId, isOwnProfile, currentUser, roomHistory.length, followers.length, following.length, suggestedUsers.length]);

  // Check if user is blocked
  useEffect(() => {
    if (!currentUser || isOwnProfile) return;
    isUserBlocked(currentUser.uid, userId).then(setBlocked).catch(() => {});
  }, [currentUser, userId, isOwnProfile]);

  // Load blocked list when viewing own profile (to filter Following/Followers)
  useEffect(() => {
    if (!currentUser || !isOwnProfile) return;
    getBlockedUsers(currentUser.uid).then((list) => setBlockedIds(new Set(list.map((b) => b.id)))).catch(() => {});
  }, [currentUser, isOwnProfile]);

  const handleBlock = async () => {
    if (!currentUser) return;
    setBlockLoading(true);
    try {
      if (blocked) {
        await unblockUser(currentUser.uid, userId);
        setBlocked(false);
      } else {
        await blockUser(currentUser.uid, userId);
        setBlocked(true);
      }
    } catch (err) {
      console.error("Failed to update block status:", err);
    } finally {
      setBlockLoading(false);
      setShowMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">User not found</h1>
        <p className="text-white/50 text-sm mb-6">This account doesn't exist</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  const displayName = profile.displayName || profile.username || "User";

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">{profile.username ? `@${profile.username}` : displayName}</h1>
          </div>
          {/* Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isOwnProfile ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              )}
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#0f1a15] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {isOwnProfile ? (
                  <>
                    <Link
                      href="/messages"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Messages
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Settings
                    </Link>
                    <div className="border-t border-white/10" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        signOut();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowReportModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                      Report User
                    </button>
                    <button
                      onClick={handleBlock}
                      disabled={blockLoading}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      {blockLoading ? "Loading..." : blocked ? "Unblock User" : "Block User"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Left column: Avatar */}
          <div className="flex-shrink-0">
            {profile.photoURL ? (
              <Image
                src={profile.photoURL}
                alt={displayName}
                width={88}
                height={88}
                className="w-22 h-22 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="w-22 h-22 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-2xl font-bold text-[#D4AF37] ring-2 ring-white/10">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Right column: Stats row + XP section */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Row 1: Rooms, Followers, Following */}
            <div className="flex items-center justify-around">
              <button
                onClick={() => setActiveTab("history")}
                className="text-center"
              >
                <p className="text-xl font-bold">{roomHistory.length || 0}</p>
                <p className="text-xs text-white/50">Rooms</p>
              </button>
              <button
                onClick={() => setActiveTab("followers")}
                className="text-center"
              >
                <p className="text-xl font-bold">{counts.followerCount}</p>
                <p className="text-xs text-white/50">Followers</p>
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className="text-center"
              >
                <p className="text-xl font-bold">{counts.followingCount}</p>
                <p className="text-xs text-white/50">Following</p>
              </button>
            </div>
            {/* Row 2: XP section - same width as stats row */}
            <div className="w-full mt-3 px-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[#D4AF37]">
                  {profile.listenerTitle || getTitleFromLevel(profile.level ?? 1)}
                </span>
                <span className="text-[10px] text-white/40">
                  Lvl {profile.level ?? 1} · {formatListeningTime(profile.totalListeningMinutes ?? 0)}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37]/80 to-[#D4AF37] rounded-full transition-all duration-500"
                  style={{
                    width: `${getXpProgress(profile.xp ?? 0).percent}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Name & Bio */}
        <div className="mt-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.admin && (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/30">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-xs font-medium text-rose-400">Admin</span>
              </div>
            )}
            {profile.partner && (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4AF37">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-[#D4AF37]">Official Partner</span>
              </div>
            )}
            {profile?.isPremium && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                </svg>
                <span className="text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Pro Member</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-1">
          {isOwnProfile ? (
            <>
              <Link
                href="/profile"
                className="flex-1 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium text-center hover:bg-white/20 transition-colors"
              >
                Edit Profile
              </Link>
              <Link
                href="/messages"
                className="w-12 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </Link>
            </>
          ) : blocked ? (
            <>
              <div className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm text-center">
                You have blocked this user
              </div>
              <button
                onClick={handleBlock}
                disabled={blockLoading}
                className="flex-1 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {blockLoading ? "..." : "Unblock"}
              </button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <FollowButton targetUserId={userId} size="md" className="w-full py-2" />
              </div>
              <Link
                href={`/messages/${userId}`}
                className="flex-1 py-2 rounded-lg bg-white/10 text-white text-sm font-medium text-center hover:bg-white/20 transition-colors"
              >
                Message
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            title={shareCopied ? "Link copied!" : "Share profile"}
          >
            {shareCopied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[60px] z-40 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto flex">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-white text-white"
                : "border-transparent text-white/50 hover:text-white/70"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "followers"
                ? "border-white text-white"
                : "border-transparent text-white/50 hover:text-white/70"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "following"
                ? "border-white text-white"
                : "border-transparent text-white/50 hover:text-white/70"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "discover"
                  ? "border-white text-white"
                  : "border-transparent text-white/50 hover:text-white/70"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-lg mx-auto px-4 py-4 min-h-[300px]">
        {/* Room History Tab */}
        {activeTab === "history" && (
          <>
            {profile.privateHistory && !isOwnProfile ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">This user's history is private</p>
              </div>
            ) : historyLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              </div>
            ) : roomHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">No room activity yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {roomHistory.map((room, idx) => (
                  <Link
                    key={idx}
                    href={`/rooms/${room.roomId}`}
                    className="aspect-square bg-white/5 rounded-lg flex flex-col items-center justify-center p-2 hover:bg-white/10 transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50 mb-1">
                      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M12 10h.01" />
                    </svg>
                    <p className="text-xs text-white/70 truncate w-full text-center">{room.roomName}</p>
                    <p className="text-[10px] text-white/40">{room.role}</p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Followers Tab */}
        {activeTab === "followers" && (
          <>
            {profile.privateFollowers && !isOwnProfile ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">This user's followers are private</p>
              </div>
            ) : followersLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              </div>
            ) : (isOwnProfile ? followers.filter((f) => !blockedIds.has(f.id)) : followers).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">No followers yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(isOwnProfile ? followers.filter((f) => !blockedIds.has(f.id)) : followers).map((follower) => (
                  <UserListItem key={follower.id} user={follower} currentUserId={currentUser?.uid} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Following Tab */}
        {activeTab === "following" && (
          <>
            {followingLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              </div>
            ) : (isOwnProfile ? following.filter((u) => !blockedIds.has(u.id)) : following).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">Not following anyone yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(isOwnProfile ? following.filter((u) => !blockedIds.has(u.id)) : following).map((user) => (
                  <UserListItem key={user.id} user={user} currentUserId={currentUser?.uid} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Discover Tab (Only for own profile) */}
        {activeTab === "discover" && isOwnProfile && (
          <>
            {suggestedLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              </div>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">No suggestions yet</p>
                <p className="text-white/30 text-xs mt-1">Follow more people to get personalized suggestions</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-white/40 mb-3 px-1">People you may know</p>
                {suggestedUsers.map((user) => (
                  <UserListItem key={user.id} user={user} currentUserId={currentUser?.uid} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Modal */}
      {currentUser && !isOwnProfile && (
        <ReportModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          reporterId={currentUser.uid}
          targetType="user"
          targetId={userId}
          targetUserId={userId}
          targetLabel={profile.username ? `@${profile.username}` : displayName}
        />
      )}
    </div>
  );
}

// User list item component
function UserListItem({ user, currentUserId }: { user: FollowUser; currentUserId?: string }) {
  return (
    <Link
      href={`/user/${user.id}`}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
    >
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.username || user.displayName || "User"}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover"
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-semibold">
          {(user.username || user.displayName || "U")[0].toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm truncate">
          {user.displayName || user.username || "User"}
        </p>
        {user.username && (
          <p className="text-xs text-white/50 truncate">@{user.username}</p>
        )}
        {user.mutualCount && user.mutualCount > 0 && (
          <p className="text-xs text-[#D4AF37]/70 mt-0.5">
            {user.mutualCount} mutual{user.mutualCount > 1 ? "s" : ""}
          </p>
        )}
      </div>
      {currentUserId && currentUserId !== user.id && (
        <FollowButton targetUserId={user.id} size="sm" />
      )}
    </Link>
  );
}
