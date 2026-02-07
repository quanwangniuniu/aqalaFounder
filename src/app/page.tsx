"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrayer } from "@/contexts/PrayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { formatPrayerTime } from "@/lib/prayer/calculations";
import AdLink from "@/components/AdLink";

export default function Page() {
  const { t, isRTL } = useLanguage();
  const { nextPrayer, loading: prayerLoading } = usePrayer();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, showAds } = useSubscription();

  return (
    <div className="relative min-h-screen overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="w-full px-4 pt-4 pb-2">
          <div className="max-w-[554px] mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="hero-fade-in">
              <Image
                src="/aqala-logo.png"
                alt="Aqala"
                width={64}
                height={64}
                priority
                className="invert drop-shadow-lg w-auto"
              />
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {user && (
                <Link
                  href="/search"
                  className="hero-fade-in p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                  aria-label="Search users"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </Link>
              )}

              {/* Profile / Sign In */}
              {!authLoading && (
                user ? (
                  <Link
                    href={`/user/${user.uid}`}
                    className="hero-fade-in flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/10 transition-all"
                >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-semibold">
                        {(user.username || user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                    )}
                    <div className="pr-1">
                      <p className="text-xs font-medium text-white leading-tight">
                        {user.username ? `@${user.username}` : user.displayName?.split(" ")[0] || "Profile"}
                      </p>
                      {isPremium && (
                        <p className="text-[10px] text-[#D4AF37]">Premium ✨</p>
                  )}
                    </div>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                    className="hero-fade-in flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#021a12] font-medium text-sm hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all"
                >
                    Sign In
                </Link>
              )
            )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col px-4 pb-6">
          <div className="max-w-[554px] mx-auto w-full flex-1 flex flex-col">
            
            {/* Hero Section - Primary CTA */}
            <section className="hero-fade-in hero-fade-in-delay-1 mt-4 sm:mt-8">
              <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 sm:p-8">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative">
                  {/* Headline */}
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight mb-3">
                    {t("home.headline1")}
                    <span className="block text-gradient-gold">{t("home.headline2")}</span>
                  </h1>

                  {/* Subheadline */}
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-6 max-w-md">
                    {t("home.subheadline")}
                  </p>

                  {/* Primary CTA */}
                  <AdLink
                    href="/listen"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#032117] font-semibold text-base px-6 py-3.5 shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#032117]/20 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
                        <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
                      </svg>
                    </div>
                    {t("home.startListening")}
                  </AdLink>
                </div>
              </div>
            </section>

            {/* Feature Grid */}
            <section className="hero-fade-in hero-fade-in-delay-2 mt-4 grid grid-cols-2 gap-3">
              {/* Prayer Times Card */}
              <AdLink
                href="/prayers"
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 hover:bg-white/10 hover:border-[#D4AF37]/20 transition-all"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#D4AF37]/10 transition-colors" />
                
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  
                  <p className="text-xs text-white/50 mb-0.5">Prayer Times</p>
                  {!prayerLoading && nextPrayer ? (
                    <>
                      <p className="text-lg font-semibold text-white leading-tight">{nextPrayer.name}</p>
                      <p className="text-xs text-[#D4AF37]/80">{formatPrayerTime(nextPrayer.time)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-white/60">View schedule</p>
                  )}
                </div>
              </AdLink>

              {/* Qibla Card */}
              <AdLink
                href="/qibla"
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 hover:bg-white/10 hover:border-[#D4AF37]/20 transition-all"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#D4AF37]/10 transition-colors" />
                
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="3" fill="#D4AF37" stroke="none" />
                    </svg>
                  </div>
                  
                  <p className="text-xs text-white/50 mb-0.5">Qibla Finder</p>
                  <p className="text-sm font-medium text-white">Find Direction</p>
                  <p className="text-xs text-white/40">Compass guide</p>
                </div>
              </AdLink>

              {/* Mosques Card */}
              <AdLink
                href="/rooms"
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 hover:bg-white/10 hover:border-[#D4AF37]/20 transition-all"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#D4AF37]/10 transition-colors" />
                
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                      <path d="M3 21h18" strokeLinecap="round" />
                      <path d="M5 21V7l7-4 7 4v14" />
                      <path d="M9 21v-6h6v6" />
                      <circle cx="12" cy="10" r="2" />
                    </svg>
                  </div>
                  
                  <p className="text-xs text-white/50 mb-0.5">Mosques</p>
                  <p className="text-sm font-medium text-white">Join a Room</p>
                  <p className="text-xs text-white/40">Shared listening</p>
                </div>
              </AdLink>

              {/* Support Card */}
              {showAds && user ? (
                <Link
                  href="/subscription"
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 backdrop-blur-md border border-[#D4AF37]/20 p-4 hover:from-[#D4AF37]/15 hover:to-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#D4AF37]/15 transition-colors" />
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    
                    <p className="text-xs text-[#D4AF37]/70 mb-0.5">Go Premium</p>
                    <p className="text-sm font-medium text-white">Remove Ads</p>
                    <p className="text-xs text-[#D4AF37]">$15 one-time</p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/donate"
                  className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 hover:bg-white/10 hover:border-[#D4AF37]/20 transition-all"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#D4AF37]/10 transition-colors" />
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                    
                    <p className="text-xs text-white/50 mb-0.5">Support</p>
                    <p className="text-sm font-medium text-white">Donate</p>
                    <p className="text-xs text-white/40">{t("home.helpKeepFree")}</p>
                  </div>
                </Link>
              )}
            </section>

            {/* Bottom Section */}
            <section className="hero-fade-in hero-fade-in-delay-3 pt-8">
              {/* Quranic verse */}
              <div className="text-center mb-4">
                <p className="quran-verse text-sm text-white/50 max-w-xs mx-auto">
                  {t("home.quranVerse")}
                  <span className="block mt-1 text-xs text-white/30">{t("home.quranRef")}</span>
                </p>
              </div>

              {/* Bottom actions */}
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/reviews"
                  className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {t("home.shareThoughts")}
                </Link>
                
                <span className="w-1 h-1 rounded-full bg-white/20" />
                
                <p className="text-xs text-white/30">
                  {isPremium ? "Thank you for supporting Aqala ✨" : t("home.freeForever")}
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
