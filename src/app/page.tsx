"use client";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 hero-gradient-bg" />
      <div className="absolute inset-0 hero-geometric-overlay" />
      <div className="absolute inset-0 hero-pattern" />

      {/* Mosque silhouette at bottom */}
      {/* Mosque silhouette - mobile only */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%] opacity-15 pointer-events-none sm:hidden"
        style={{
          backgroundImage: "url('/backgroundmosque.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header area with logo */}
        <header className="w-full pt-10 lg:pb-10">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <Link href="/" className="hero-fade-in">
              <Image
                src="/aqala-logo.png"
                alt="Aqala"
                width={112}
                height={112}
                priority
                className="invert drop-shadow-lg w-auto"
              />
            </Link>
          </div>
        </header>

        {/* Main hero content */}
        <main className="flex-1 flex  lg:pt-0 md:items-center items-center justify-center px-5 sm:px-6 pb-8 sm:pb-16">
          <div className="max-w-2xl mx-auto text-center -mt-8">
            {/* Headline */}
            <h1 className="hero-fade-in hero-fade-in-delay-1 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.15] mb-4 sm:mb-6">
              Don't just listen.
              <span className="block text-gradient-gold">Understand.</span>
            </h1>

            {/* Subheadline */}
            <p className="hero-fade-in hero-fade-in-delay-2 text-base sm:text-xl text-white/80 leading-relaxed max-w-xl mx-auto mb-6 sm:mb-8">
            Aqala translates spoken Islamic Arabic - Qur’an, khutbahs, and lectures - into clear, real-time meaning in any language.  
            </p>

            {/* Quranic reasoning */}
            <p className="hero-fade-in hero-fade-in-delay-3 quran-verse text-sm sm:text-lg text-white/60 mb-8 sm:mb-12 max-w-sm sm:max-w-md mx-auto">
              Because Allah calls us to reflect, not merely recite.
              <span className="block mt-1 text-xs sm:text-sm text-white/40">
                (Qur'an 47:24)
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="hero-fade-in hero-fade-in-delay-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
              <Link
                href="/listen"
                className="btn-primary-glow group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-[#0c1f2d] font-semibold text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 shadow-xl shadow-black/20"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-transform group-hover:scale-110 sm:w-[22px] sm:h-[22px]"
                >
                  <path
                    d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
                    fill="currentColor"
                  />
                  <path
                    d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z"
                    fill="currentColor"
                  />
                </svg>
                Start Listening
              </Link>

              <Link
                href="/donate"
                className="btn-secondary-subtle w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white font-medium text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#c9a962] sm:w-[20px] sm:h-[20px]"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="currentColor"
                  />
                </svg>
                Help keep Aqala free
              </Link>
            </div>

            {/* Trust indicator */}
            <p className="hero-fade-in hero-fade-in-delay-5 mt-8 sm:mt-12 text-xs sm:text-sm text-white/40">
              Free forever 
            </p>
          </div>
        </main>

        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
