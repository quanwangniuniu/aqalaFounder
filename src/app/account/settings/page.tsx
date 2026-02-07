"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePreferences, WALLPAPERS, WallpaperId } from "@/contexts/PreferencesContext";
import { useLanguage, LANGUAGE_OPTIONS } from "@/contexts/LanguageContext";
import { getUserInitials } from "@/utils/userDisplay";

export default function AccountSettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { wallpaper, setWallpaper, getWallpaperStyle } = usePreferences();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent("/account/settings")}`);
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#032117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">Account Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-5 space-y-8">
        {/* Profile Section */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            Profile
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xl font-semibold">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || user.email || "User"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials(user)
                  )}
                </div>
                {isPremium && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-full border-2 border-[#032117] flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#032117]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-medium text-white truncate">
                  {user.displayName || "User"}
                </p>
                <p className="text-sm text-white/50 truncate">{user.email}</p>
                <p className="text-xs mt-1">
                  {isPremium ? (
                    <span className="text-[#D4AF37]">✨ Premium Member</span>
                  ) : (
                    <span className="text-white/40">Free Plan</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            Language
          </h2>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0a1f16] text-white">
                  {lang.flag} {lang.label} ({lang.nativeLabel})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </section>

        {/* Wallpaper Section */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            Wallpaper
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {WALLPAPERS.map((wp) => (
              <button
                key={wp.id}
                onClick={() => setWallpaper(wp.id)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                  wallpaper === wp.id
                    ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                {/* Wallpaper preview */}
                <div
                  className="absolute inset-0"
                  style={{ background: wp.gradient }}
                />
                
                {/* Label */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <span className="text-[10px] font-medium text-white/90 leading-tight block">
                    {wp.name}
                  </span>
                </div>
                
                {/* Selected checkmark */}
                {wallpaper === wp.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#032117]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-3">
            Choose a wallpaper for your home screen
          </p>
        </section>

        {/* Subscription Section */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            Subscription
          </h2>
          <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
            {isPremium ? (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Premium Active</p>
                    <p className="text-xs text-white/50">Ad-free experience enabled</p>
                  </div>
                </div>
                <Link
                  href="/subscription/manage"
                  className="block w-full text-center py-2.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Manage Subscription
                </Link>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Free Plan</p>
                    <p className="text-xs text-white/50">Upgrade to remove ads</p>
                  </div>
                </div>
                <Link
                  href="/subscription"
                  className="block w-full text-center py-3 text-sm font-semibold text-[#032117] bg-gradient-to-r from-[#D4AF37] to-[#c9a431] hover:from-[#E8D5A3] hover:to-[#D4AF37] rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Go Ad-Free • $15/year
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Account Actions */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            Account
          </h2>
          <div className="space-y-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Sign Out</p>
                <p className="text-xs text-white/50">Log out of your account</p>
              </div>
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center pt-4 pb-8">
          <Image
            src="/aqala-logo.png"
            alt="Aqala"
            width={80}
            height={28}
            className="mx-auto opacity-30 brightness-0 invert mb-2"
          />
          <p className="text-xs text-white/30">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
