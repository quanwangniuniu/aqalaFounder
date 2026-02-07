"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLiveKitBroadcast, BroadcastMessage } from "@/hooks/useLiveKitBroadcast";

interface LiveKitListenerProps {
  roomName: string;
  listenerName: string;
  mosqueName?: string;
  hideHeader?: boolean;
}

const LANG_OPTIONS = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ur", label: "اردو" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "tr", label: "Türkçe" },
  { code: "id", label: "Indonesia" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ms", label: "Melayu" },
  { code: "fa", label: "فارسی" },
  { code: "sw", label: "Kiswahili" },
];

export default function LiveKitListener({
  roomName,
  listenerName,
  mosqueName,
}: LiveKitListenerProps) {
  // Original text from broadcaster
  const [originalText, setOriginalText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  
  // Displayed/translated text
  const [displayedParagraphs, setDisplayedParagraphs] = useState<string[]>([]);
  const [targetLang, setTargetLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [hasAudio, setHasAudio] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const hasConnectedRef = useRef(false);
  const langSelectorRef = useRef<HTMLDivElement>(null);
  const translationCacheRef = useRef<Map<string, string>>(new Map());
  const pendingTranslationRef = useRef<AbortController | null>(null);

  const labelFor = (code: string) =>
    LANG_OPTIONS.find((l) => l.code === code)?.label ?? code.toUpperCase();

  // Parse text into paragraphs
  const parseParagraphs = (text: string): string[] => {
    return text
      .replace(/<end>/gi, "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  };

  // Translate text to target language
  const translateText = useCallback(async (text: string, fromLang: string, toLang: string): Promise<string> => {
    // Check cache first
    const cacheKey = `${fromLang}-${toLang}-${text.slice(0, 100)}`;
    const cached = translationCacheRef.current.get(cacheKey);
    if (cached) return cached;

    // If same language, return original
    if (fromLang === toLang) return text;

    try {
      // Cancel any pending translation
      if (pendingTranslationRef.current) {
        pendingTranslationRef.current.abort();
      }
      
      const controller = new AbortController();
      pendingTranslationRef.current = controller;

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLang: toLang,
          sourceLang: fromLang,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      const translatedText = data.translatedText || text;
      
      // Cache the result
      translationCacheRef.current.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return text;
      }
      console.error("Translation error:", error);
      return text;
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((message: BroadcastMessage) => {
    if (message.type === "translation" && message.text) {
      const newText = message.text.replace(/<end>/gi, "");
      setOriginalText(newText);
      if (message.lang) setSourceLang(message.lang);
      
      // If target matches source, display directly
      if (targetLang === (message.lang || "en")) {
        setDisplayedParagraphs(parseParagraphs(newText));
      }
    }
  }, [targetLang]);

  const {
    connect,
    isConnected,
    hasRemoteAudio,
    error,
  } = useLiveKitBroadcast({
    roomName,
    participantName: listenerName,
    isPublisher: false,
    onMessage: handleMessage,
    onAudioStateChange: setHasAudio,
  });

  // Connect on mount
  useEffect(() => {
    if (!hasConnectedRef.current) {
      hasConnectedRef.current = true;
      connect();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-translate when target language changes or original text updates
  useEffect(() => {
    if (!originalText) return;
    
    const translate = async () => {
      // If same language, display original
      if (targetLang === sourceLang) {
        setDisplayedParagraphs(parseParagraphs(originalText));
        return;
      }
      
      setIsTranslating(true);
      try {
        const translated = await translateText(originalText, sourceLang, targetLang);
        setDisplayedParagraphs(parseParagraphs(translated));
      } finally {
        setIsTranslating(false);
      }
    };
    
    translate();
  }, [originalText, targetLang, sourceLang, translateText]);

  // Auto-scroll
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedParagraphs]);

  // Close language selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langSelectorRef.current && !langSelectorRef.current.contains(e.target as Node)) {
        setShowLangSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle audio
  const toggleMute = useCallback(() => {
    const audioElements = document.querySelectorAll('audio[id^="audio-"]');
    audioElements.forEach((el) => {
      (el as HTMLAudioElement).muted = !audioMuted;
    });
    setAudioMuted(!audioMuted);
  }, [audioMuted]);

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setTargetLang(langCode);
    setShowLangSelector(false);
  };

  const isAudioPlaying = (hasAudio || hasRemoteAudio) && !audioMuted;

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap");
        `}</style>
        
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => { hasConnectedRef.current = false; connect(); }}
            className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/15 transition-colors"
          >
            Try Again
          </button>
        </main>
      </div>
    );
  }

  // Connecting state
  if (!isConnected) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap");
        `}</style>
        
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-2 border-[#D4AF37]/20 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
          <p className="text-white/60 text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Connecting to {mosqueName || "broadcast"}...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Google Fonts */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap");
      `}</style>

      {/* Top control bar */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-[#0a0c0f]/50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Language selector */}
          <div ref={langSelectorRef} className="relative">
            <button
              onClick={() => setShowLangSelector(!showLangSelector)}
              disabled={isTranslating}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#D4AF37]">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-sm text-white/80 font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {labelFor(targetLang)}
              </span>
              {isTranslating ? (
                <div className="w-3 h-3 border border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>

            {/* Dropdown */}
            {showLangSelector && (
              <div className="absolute top-full left-0 mt-2 w-48 max-h-64 overflow-y-auto rounded-xl bg-[#0a1a14] border border-white/10 shadow-2xl shadow-black/50 z-50">
                <div className="p-2 border-b border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider px-2">Translate to</p>
                </div>
                <div className="py-1">
                  {LANG_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        targetLang === lang.code
                          ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Audio + LIVE */}
          <div className="flex items-center gap-2">
            {/* Audio control */}
            {(hasAudio || hasRemoteAudio) && (
              <button
                onClick={toggleMute}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                  audioMuted
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {audioMuted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
                <span className="text-xs font-medium hidden sm:inline">
                  {audioMuted ? "Muted" : "Audio"}
                </span>
              </button>
            )}

            {/* Translating indicator */}
            {isTranslating && (
              <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <div className="w-3 h-3 border border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                <span className="text-[10px] text-[#D4AF37] font-medium">Translating</span>
              </div>
            )}

            {/* LIVE indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Translation output */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-5 py-6"
        >
          {/* Content wrapper */}
          <div className={`max-w-2xl mx-auto w-full ${displayedParagraphs.length === 0 ? 'flex-1 flex flex-col justify-center min-h-full' : ''}`}>
            {displayedParagraphs.length > 0 ? (
              displayedParagraphs.map((p, i) => (
                <div
                  key={`p-${i}`}
                  className="translation-paragraph"
                >
                  <p
                    className="text-[20px] leading-[2.1] text-white/90"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {p}
                  </p>
                </div>
              ))
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                {isAudioPlaying ? (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 rounded-full"
                              style={{
                                animation: `audioBar 0.6s ease-in-out infinite`,
                                animationDelay: `${i * 100}ms`,
                                height: "16px",
                                background: "linear-gradient(to top, #D4AF37, #E8D5A3)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-white/50 text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Listening...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/20">
                          <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 w-16 h-16 rounded-full border border-white/5 animate-ping" style={{ animationDuration: "3s" }} />
                    </div>
                    <p className="text-white/50 text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Listening for {labelFor(targetLang)} translation...
                    </p>
                    <p className="text-white/30 text-sm">
                      Translation will appear here
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          <div ref={endRef} aria-hidden="true" />
        </div>
      </main>

      <style jsx>{`
        @keyframes audioBar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .translation-paragraph + .translation-paragraph {
          margin-top: 1.5rem;
        }
        div::-webkit-scrollbar {
          width: 4px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(212,175,55,0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
