"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProfileImage } from "@/lib/firebase/storage";
import { isUsernameAvailable, getUserProfile } from "@/lib/firebase/users";
import {
  getTitleFromLevel,
  getXpProgress,
  formatListeningTime,
} from "@/lib/firebase/listenerStats";
import { subscribeToUserCounts } from "@/lib/firebase/follows";
import { validateUsername } from "@/utils/profanityFilter";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [privateHistory, setPrivateHistory] = useState(false);
  const [privateFollowers, setPrivateFollowers] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [counts, setCounts] = useState({ followerCount: 0, followingCount: 0 });
  const [listenerStats, setListenerStats] = useState({
    totalListeningMinutes: 0,
    xp: 0,
    level: 1,
    listenerTitle: "",
  });
  const [initialSettings, setInitialSettings] = useState({
    username: "",
    bio: "",
    privateHistory: false,
    privateFollowers: false,
  });

  // Subscribe to follower/following counts
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToUserCounts(user.uid, setCounts);
    return () => unsubscribe();
  }, [user?.uid]);

  // Initialize user data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setPrivateHistory(profile.privateHistory);
        setPrivateFollowers(profile.privateFollowers);
        setListenerStats({
          totalListeningMinutes: profile.totalListeningMinutes ?? 0,
          xp: profile.xp ?? 0,
          level: profile.level ?? 1,
          listenerTitle: profile.listenerTitle ?? "",
        });
        setInitialSettings({
          username: profile.username || "",
          bio: profile.bio || "",
          privateHistory: profile.privateHistory,
          privateFollowers: profile.privateFollowers,
        });
      }
    };
    loadProfile();
  }, [user?.uid]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?returnUrl=/profile");
    }
  }, [user, loading, router]);

  // Debounced username validation and availability check
  useEffect(() => {
    if (!username) {
      setUsernameError(null);
      return;
    }

    // Skip check if username hasn't changed
    if (username.toLowerCase() === user?.username?.toLowerCase()) {
      setUsernameError(null);
      return;
    }

    // Validate username format, length, and content (including profanity check)
    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const available = await isUsernameAvailable(username, user?.uid);
        if (!available) {
          setUsernameError("Username is already taken");
        } else {
          setUsernameError(null);
        }
      } catch (err) {
        console.error("Error checking username:", err);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user?.username, user?.uid]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please select a JPEG, PNG, GIF, or WebP image");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  // Handle save
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updates: { 
        username?: string; 
        photoURL?: string; 
        bio?: string;
        privateHistory?: boolean;
        privateFollowers?: boolean;
      } = {};

      // Upload new image if selected
      if (selectedFile && user?.uid) {
        setIsUploading(true);
        try {
          const imageUrl = await uploadProfileImage(user.uid, selectedFile);
          updates.photoURL = imageUrl;
        } finally {
          setIsUploading(false);
        }
      }

      // Update username if changed
      if (username && username.toLowerCase() !== initialSettings.username.toLowerCase()) {
        if (usernameError) {
          setErrorMessage(usernameError);
          setIsSaving(false);
          return;
        }
        updates.username = username.toLowerCase();
      }

      // Update bio if changed
      if (bio !== initialSettings.bio) {
        updates.bio = bio;
      }

      // Update privacy settings if changed
      if (privateHistory !== initialSettings.privateHistory) {
        updates.privateHistory = privateHistory;
      }
      if (privateFollowers !== initialSettings.privateFollowers) {
        updates.privateFollowers = privateFollowers;
      }

      // Save updates
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(updates);
        setSuccessMessage("Profile updated successfully!");
        setSelectedFile(null);
        setPreviewUrl(null);
        // Update initial settings
        setInitialSettings({
          username: updates.username || initialSettings.username,
          bio: updates.bio ?? initialSettings.bio,
          privateHistory: updates.privateHistory ?? initialSettings.privateHistory,
          privateFollowers: updates.privateFollowers ?? initialSettings.privateFollowers,
        });
      } else {
        setSuccessMessage("No changes to save");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayPhoto = previewUrl || user.photoURL;
  const hasChanges = selectedFile || 
    (username && username.toLowerCase() !== initialSettings.username.toLowerCase()) ||
    bio !== initialSettings.bio ||
    privateHistory !== initialSettings.privateHistory ||
    privateFollowers !== initialSettings.privateFollowers;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">Edit Profile</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border-2 border-[#D4AF37]/20">
              {displayPhoto ? (
                <Image
                  src={displayPhoto}
                  alt={user.displayName || "Profile"}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-[#D4AF37]">
                  {(user.username || user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Upload indicator */}
            {isUploading && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            
            {/* Change photo button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#D4AF37] hover:bg-[#E0BC42] flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a1f16" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-sm text-white/40">Tap to change photo</p>

          {/* Follower/Following Stats */}
          <div className="flex gap-6 mt-4">
            <Link href="/followers" className="text-center group">
              <p className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                {counts.followerCount}
              </p>
              <p className="text-xs text-white/50">Followers</p>
            </Link>
            <Link href="/following" className="text-center group">
              <p className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                {counts.followingCount}
              </p>
              <p className="text-xs text-white/50">Following</p>
            </Link>
          </div>

          {/* Listening Stats */}
          <div className="mt-6 w-full max-w-xs mx-auto p-4 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
              Listening Stats
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">
                {listenerStats.listenerTitle || getTitleFromLevel(listenerStats.level)}
              </span>
              <span className="text-sm font-medium text-cyan-400">Level {listenerStats.level}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{
                  width: `${getXpProgress(listenerStats.xp).percent}%`,
                }}
              />
            </div>
            <p className="text-xs text-white/40">
              {formatListeningTime(listenerStats.totalListeningMinutes)} listened
            </p>
          </div>
        </div>

        {/* Username field */}
        <div className="mb-6">
          <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-2">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              maxLength={20}
              className={`w-full pl-9 pr-10 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-[#D4AF37]/50 outline-none transition-all ${
                usernameError 
                  ? "border-red-500/50 focus:border-red-500/50" 
                  : username && !checkingUsername && !usernameError && username.toLowerCase() !== user.username?.toLowerCase()
                    ? "border-emerald-500/50 focus:border-emerald-500/50"
                    : "border-white/10 focus:border-[#D4AF37]/50"
              }`}
              placeholder="your_username"
            />
            {/* Status indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {checkingUsername && (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              )}
              {!checkingUsername && username.length >= 3 && !usernameError && username.toLowerCase() !== user.username?.toLowerCase() && (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!checkingUsername && usernameError && (
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          {usernameError && (
            <p className="mt-1.5 text-xs text-red-400">{usernameError}</p>
          )}
          {!usernameError && username.length >= 3 && !checkingUsername && username.toLowerCase() !== user.username?.toLowerCase() && (
            <p className="mt-1.5 text-xs text-emerald-400">Username is available!</p>
          )}
          <p className="mt-1.5 text-xs text-white/30">This will be shown when you chat in live streams</p>
        </div>

        {/* Bio field */}
        <div className="mb-6">
          <label htmlFor="bio" className="block text-sm font-medium text-white/70 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 150))}
            maxLength={150}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 outline-none transition-all resize-none"
            placeholder="Tell others about yourself..."
          />
          <p className="mt-1.5 text-xs text-white/30">{bio.length}/150 characters</p>
        </div>

        {/* Email (read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Email
          </label>
          <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50">
            {user.email}
          </div>
          <p className="mt-1.5 text-xs text-white/30">Email cannot be changed</p>
        </div>

        {/* Privacy Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/70 mb-4">Privacy Settings</h3>
          
          {/* Private History Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl mb-3">
            <div>
              <p className="text-sm font-medium text-white">Private Room History</p>
              <p className="text-xs text-white/40 mt-0.5">Hide your room activity from other users</p>
            </div>
            <button
              onClick={() => setPrivateHistory(!privateHistory)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                privateHistory ? "bg-[#D4AF37]" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  privateHistory ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Private Followers Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Private Followers</p>
              <p className="text-xs text-white/40 mt-0.5">Hide your followers list from other users</p>
            </div>
            <button
              onClick={() => setPrivateFollowers(!privateFollowers)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                privateFollowers ? "bg-[#D4AF37]" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  privateFollowers ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving || !!usernameError || checkingUsername || !hasChanges}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#c9a431] hover:from-[#E8D5A3] hover:to-[#D4AF37] text-[#021a12] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </main>
    </div>
  );
}
