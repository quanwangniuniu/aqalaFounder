"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePrayer } from "@/contexts/PrayerContext";
import { formatPrayerTime, getImsakTime, getMethodName } from "@/lib/prayer/calculations";
import { fetchCalendarWeek, type CalendarDay } from "@/lib/prayer/calendar";
import DownloadModal from "@/components/muslimpro-replica/DownloadModal";

// Method display name by country
function getMethodDisplayName(country: string, methodId: number): string {
  if (country === "Spain") return "Basque Country";
  return getMethodName(methodId as 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16);
}

const PRAYER_ORDER = [
  { key: "fajr" as const, label: "Fajr", icon: "/app/fajr.svg" },
  { key: "dhuhr" as const, label: "Zuhr", icon: "/app/zuhr.svg" },
  { key: "asr" as const, label: "Asr", icon: "/app/asr.svg" },
  { key: "maghrib" as const, label: "Maghrib", icon: "/app/magrib.svg" },
  { key: "isha" as const, label: "Isha", icon: "/app/isha.svg" },
];

// Week data loaded from Aladhan Calendar API (replaces static mock)

const WHY_TRUST = [
  { title: "Prayer Times", desc: "Get accurate prayer times with real-time Adhan alerts. Receive location-based Salat timings. Track your prayer progress daily, build streaks, and stay consistent in your ibadah with subtle, meaningful reminders throughout the day." },
  { title: "Quran", desc: "Read, listen, and reflect on the Quran anytime, anywhere. Access the full Quran with Tajweed, audio recitations from renowned Qaris, and translations in 40+ languages. Bookmark verses, create reading goals, and personalize your journey." },
  { title: "Ummah Pro", desc: "Connect with Muslims around the world in a safe space. Join meaningful conversations, share du'as, reflections, and questions with respectful global Ummah. Discover trending topics, support one another, and feel spiritually grounded within a connected Muslim community." },
  { title: "Ask AiDeen", desc: "Your AI-powered Islamic assistant, always here to help. Ask AiDeen anything about prayer, fasting, duas, Quran, or daily Islamic guidance. It responds with insights based on trusted sources to help you understand and practice Islam confidently, anytime and anywhere." },
  { title: "Quest", desc: "Turn your daily worship into a rewarding experience. Complete Quran reading, prayer check-ins, or Islamic video tasks to earn Stars and unlock achievements. Build streaks, set personal goals, and stay spiritually motivated through daily quests that bring barakah into your routine." },
  { title: "Qibla finder", desc: "Find the Qibla accurately no matter where you are. Use the built-in compass to locate the exact direction of the Kaaba with GPS precision. Confidently align your prayers with Kaaba at any time of day." },
  { title: "Ramadan & Fasting Tracker", desc: "Stay organized and spiritually focused throughout Ramadan. Track your daily Suhoor and Iftar times, log missed fasts, and plan Qadha with ease. Receive timely reminders, reflections, and motivational insights to stay consistent and intentional in your fasting journey, every day of the holy month." },
];

const CITIES_BY_COUNTRY: Record<string, { name: string; country: string }[]> = {
  "United States": [
    { name: "New York City", country: "United States" },
    { name: "Los Angeles", country: "United States" },
    { name: "Brooklyn", country: "United States" },
    { name: "Chicago", country: "United States" },
    { name: "Queens", country: "United States" },
    { name: "Houston", country: "United States" },
    { name: "Phoenix", country: "United States" },
    { name: "Philadelphia", country: "United States" },
    { name: "San Antonio", country: "United States" },
    { name: "Manhattan", country: "United States" },
    { name: "San Diego", country: "United States" },
    { name: "The Bronx", country: "United States" },
    { name: "Pasadena", country: "United States" },
  ],
  Australia: [
    { name: "Sydney", country: "Australia" },
    { name: "Melbourne", country: "Australia" },
    { name: "Brisbane", country: "Australia" },
    { name: "Perth", country: "Australia" },
    { name: "Adelaide", country: "Australia" },
    { name: "Gold Coast", country: "Australia" },
    { name: "Newcastle", country: "Australia" },
    { name: "Canberra", country: "Australia" },
    { name: "Sunshine Coast", country: "Australia" },
    { name: "Logan City", country: "Australia" },
    { name: "Wollongong", country: "Australia" },
    { name: "Geelong", country: "Australia" },
  ],
  Spain: [
    { name: "Madrid", country: "Spain" },
    { name: "Barcelona", country: "Spain" },
    { name: "Valencia", country: "Spain" },
    { name: "Sevilla", country: "Spain" },
    { name: "Zaragoza", country: "Spain" },
    { name: "Malaga", country: "Spain" },
    { name: "Murcia", country: "Spain" },
    { name: "Palma", country: "Spain" },
    { name: "Las Palmas de Gran Canaria", country: "Spain" },
    { name: "Alicante", country: "Spain" },
    { name: "Bilbao", country: "Spain" },
    { name: "Cordoba", country: "Spain" },
  ],
  Canada: [
    { name: "Toronto", country: "Canada" },
    { name: "Montreal", country: "Canada" },
    { name: "Calgary", country: "Canada" },
    { name: "Ottawa", country: "Canada" },
    { name: "Edmonton", country: "Canada" },
    { name: "Winnipeg", country: "Canada" },
    { name: "Mississauga", country: "Canada" },
    { name: "Vancouver", country: "Canada" },
    { name: "Brampton", country: "Canada" },
    { name: "Hamilton", country: "Canada" },
    { name: "Surrey", country: "Canada" },
    { name: "Quebec", country: "Canada" },
  ],
  Germany: [
    { name: "Berlin", country: "Germany" },
    { name: "Munich", country: "Germany" },
    { name: "Hamburg", country: "Germany" },
    { name: "Frankfurt", country: "Germany" },
    { name: "Cologne", country: "Germany" },
    { name: "Stuttgart", country: "Germany" },
    { name: "Düsseldorf", country: "Germany" },
    { name: "Dortmund", country: "Germany" },
    { name: "Essen", country: "Germany" },
    { name: "Leipzig", country: "Germany" },
    { name: "Kassel", country: "Germany" },
    { name: "Bremen", country: "Germany" },
  ],
  Netherlands: [
    { name: "Amsterdam", country: "Netherlands" },
    { name: "Rotterdam", country: "Netherlands" },
    { name: "Utrecht", country: "Netherlands" },
    { name: "Groningen", country: "Netherlands" },
    { name: "Eindhoven", country: "Netherlands" },
    { name: "Tilburg", country: "Netherlands" },
    { name: "Almere Stad", country: "Netherlands" },
    { name: "Breda", country: "Netherlands" },
    { name: "Nijmegen", country: "Netherlands" },
    { name: "Enschede", country: "Netherlands" },
    { name: "Haarlem", country: "Netherlands" },
    { name: "Arnhem", country: "Netherlands" },
  ],
};

const RECENT_POSTS_BY_COUNTRY: Record<string, { username: string; time: string; location: string; content: string; avatar: string }[]> = {
  "United States": [
    { username: "Ahmad_N", time: "1h", location: "United States", content: "Used Aqala's translation during Jummah today — finally understood the full khutbah. JazakAllahu Khairan.", avatar: "A" },
    { username: "Sara_M", time: "2h", location: "United States", content: "Ramadan Mubarak to the Ummah. May Allah accept our fasts and prayers. 🤲", avatar: "S" },
    { username: "Omar_K", time: "2h", location: "United States", content: "Listening with the family — kids loved following the Quran in Urdu. MashaAllah.", avatar: "O" },
    { username: "Fatima_R", time: "5h", location: "United States", content: "Prayer times are spot on for my city. BarakAllahu feekum.", avatar: "F" },
  ],
  Australia: [
    { username: "Hassan_A", time: "1d", location: "Australia", content: "Laylat al-Qadr Mubarak 🌒. May we all find it and be forgiven.", avatar: "H" },
    { username: "Amina_L", time: "3d", location: "Australia", content: "Please remember me in your duas. Going through a difficult time. JazakAllahu Khairan.", avatar: "A" },
    { username: "Yusuf_T", time: "6d", location: "Australia", content: "Alhamdulillah for another Ramadan. Making dua for the Ummah worldwide.", avatar: "Y" },
    { username: "Zainab_H", time: "7d", location: "Australia", content: "The real-time translation feature is a blessing for reverts. May Allah reward the team.", avatar: "Z" },
  ],
  Spain: [
    { username: "Ibrahim_S", time: "3h", location: "Spain", content: "Ramadan Kareem! May this month bring peace and barakah to all. 🤲", avatar: "I" },
    { username: "Mariam_B", time: "5h", location: "Spain", content: "Taraweeh at the masjid tonight was beautiful. Alhamdulillah.", avatar: "M" },
    { username: "Khalid_V", time: "1d", location: "Spain", content: "Dua for Palestine and all oppressed. Ya Rabb, ease their suffering.", avatar: "K" },
    { username: "Layla_M", time: "2d", location: "Spain", content: "Last 10 nights — seeking Laylat al-Qadr. May Allah accept our worship.", avatar: "L" },
  ],
  Canada: [
    { username: "Noor_C", time: "6h", location: "Canada", content: "السلام عليكم ورحمة الله وبركاته. Ramadan Mubarak!", avatar: "N" },
    { username: "Adam_T", time: "15h", location: "Canada", content: "Please make dua for my mother's health. JazakAllahu Khairan to this community.", avatar: "A" },
    { username: "Hana_J", time: "1d", location: "Canada", content: "Using Aqala to listen to lectures with translation. Game changer for my learning.", avatar: "H" },
    { username: "Bilal_R", time: "1d", location: "Canada", content: "Blessed to have found this blessed night. May Allah accept from us all.", avatar: "B" },
  ],
  Germany: [
    { username: "Idris_F", time: "2h", location: "Germany", content: "Ramadan Kareem! May this month bring peace. 🤲", avatar: "I" },
    { username: "Aisha_M", time: "5h", location: "Germany", content: "Another day of fasting. Making dua for the Ummah. Alhamdulillah.", avatar: "A" },
    { username: "Tariq_B", time: "1d", location: "Germany", content: "Seeking Laylat al-Qadr in these last nights. Ya Allah, accept our worship.", avatar: "T" },
    { username: "Zara_K", time: "2d", location: "Germany", content: "Community at the masjid was beautiful tonight. JazakAllahu Khairan.", avatar: "Z" },
  ],
  Netherlands: [
    { username: "Rashid_A", time: "2h", location: "Netherlands", content: "Please make dua for my niece. She is going through a difficult time. JazakAllahu Khairan.", avatar: "R" },
    { username: "Sana_V", time: "2d", location: "Netherlands", content: "Assalamu Alaikum. Requesting duas for my health. May Allah reward you all.", avatar: "S" },
    { username: "Hamza_D", time: "5d", location: "Netherlands", content: "Aqala's live translation helped our study circle follow along in everyone's language.", avatar: "H" },
    { username: "Nadia_L", time: "1d", location: "Netherlands", content: "Dua for unity and strength of the Ummah. In Shaa Allah.", avatar: "N" },
  ],
};

const BLOG_POSTS = [
  { title: "Laylat al-Qadr: When the Heavens Open", date: "March 12, 2026", href: "/app/blog" },
  { title: "Ramadan's Final Ten Nights: A Practical Guide", date: "March 10, 2026", href: "/app/blog" },
  { title: "I'tikaf: Stepping Back to Reconnect", date: "March 10, 2026", href: "/app/blog" },
];

const FAQ = [
  { a: "Prayer times are calculated based on your location using the Muslim World League (MWL) method by default. You can switch to other recognized methods (e.g. Umm al-Qura, ISNA, Egyptian) under Settings. GPS ensures accuracy, and you can manually adjust timings to align with your local mosque if needed." },
  { a: "Suhoor ends at Fajr and Iftar begins at Maghrib. These times update automatically based on your location and appear in the Ramadan section. You can enable fasting reminders in Settings." },
  { q: "Can I get reminders for each prayer?", a: "Yes. Go to Settings > Notifications and choose which prayers you'd like alerts for. Aqala will notify you at the correct time for your location." },
  { q: "How does real-time translation work?", a: "Aqala translates spoken Islamic content — khutbahs, lectures, Quran recitation — into your language as you listen. Open the Listen page, play any audio, and see the translation appear in real time. Works in 20+ languages." },
  { q: "Is Aqala safe for families?", a: "Yes. Aqala is designed to be family-friendly. The Listen experience is suitable for all ages so families can learn together." },
];

// Premium countdown: end of day (demo)
function usePremiumCountdown() {
  const [remaining, setRemaining] = useState({ h: 13, m: 53, s: 46 });
  useEffect(() => {
    const t = setInterval(() => {
      setRemaining((r) => {
        let { h, m, s } = r;
        s--;
        if (s < 0) {
          s = 59;
          m--;
          if (m < 0) {
            m = 59;
            h = Math.max(0, h - 1);
          }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return remaining;
}

export default function MuslimProPrayerTimesPage() {
  const { prayerTimes, nextPrayer, currentPrayer, timeUntilNext, loading, location, setLocationFromSearch, settings } = usePrayer();
  const locationLabel = location?.city && location?.country ? `${location.city}, ${location.country}` : "Pasadena, United States";
  const cityName = location?.city || "Pasadena";
  const countryName = location?.country || "United States";

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [weekData, setWeekData] = useState<CalendarDay[]>([]);
  const [todayHijri, setTodayHijri] = useState("");
  const [weekLoading, setWeekLoading] = useState(false);
  const countdown = usePremiumCountdown();

  // Fetch calendar week from Aladhan API
  useEffect(() => {
    const lat = location?.latitude ?? 34.1478;
    const lng = location?.longitude ?? -118.1445;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    setWeekLoading(true);
    fetchCalendarWeek(lat, lng, settings.method, month, year)
      .then((res) => {
        setWeekData(res.week);
        setTodayHijri(res.todayHijri);
      })
      .catch(() => setWeekData([]))
      .finally(() => setWeekLoading(false));
  }, [location?.latitude, location?.longitude, settings.method]);

  const faqItems = [
    { q: `How are the prayer times calculated in ${countryName}?`, a: FAQ[0].a },
    { q: `When is Suhoor and Iftar today in ${countryName}?`, a: FAQ[1].a },
    ...FAQ.slice(2).map((item) => ({ q: item.q!, a: item.a })),
  ];

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data?.[0]) {
        const { lat, lon } = data[0];
        const city = data[0].address?.city || data[0].address?.town || data[0].address?.village || data[0].name;
        const country = data[0].address?.country;
        setLocationFromSearch(parseFloat(lat), parseFloat(lon), city, country);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, [searchQuery, setLocationFromSearch]);

  const isNextPrayer = (label: string) =>
    nextPrayer?.name === label || (nextPrayer?.name === "Dhuhr" && label === "Zuhr");
  const isCurrentPrayer = (label: string) =>
    currentPrayer === label || (currentPrayer === "Dhuhr" && label === "Zuhr");

  return (
    <>
      <DownloadModal isOpen={downloadModalOpen} onClose={() => setDownloadModalOpen(false)} />

      {/* Banner hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#06402B]/5 to-transparent">
        <div className="absolute inset-0 opacity-5">
          <img src="/app/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-4">
            <Link href="/app" className="hover:text-[#D4AF37]">Home</Link>
            {" > "}
            <Link href="/app/prayer-times" className="hover:text-[#D4AF37]">Prayer Times</Link>
            {" > "}
            <span className="text-white/70">World</span>
            {" > "}
            <span className="text-white/70">{countryName}</span>
            {" > "}
            <span className="text-white font-medium">{cityName}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prayer Times in {locationLabel}
          </h1>

          {/* Location search */}
          <div className="flex gap-2 mb-6 max-w-md">
            <input
              type="search"
              placeholder="Type your location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-white/50 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-colors"
              aria-label="Search for a city"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-[#032117] font-medium hover:bg-[#b8944d] disabled:opacity-60 transition-colors"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>

          <p className="text-white/70 mb-4">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} | {todayHijri || "— Ramadan 1447"}
          </p>
          <p className="text-sm text-white/50 mb-2">{getMethodDisplayName(countryName, settings.method)}</p>
          <p className="text-sm text-white/50 mb-6">
            Sehri {prayerTimes ? formatPrayerTime(getImsakTime(prayerTimes.fajr)) : "--:--"} | Iftar {prayerTimes ? formatPrayerTime(prayerTimes.maghrib) : "--:--"}
          </p>

          {/* Today's times with icons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {PRAYER_ORDER.map(({ key, label, icon }) => (
              <div key={key} className="mp-card-hover text-center p-4 rounded-xl bg-white/[0.05] border border-white/10 shadow-sm">
                <img src={icon} alt={`${label} icon`} className="w-10 h-10 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-white mb-1">{label}</p>
                {loading || !prayerTimes ? (
                  <p className="text-white/40">--:--</p>
                ) : (
                  <p className="text-[#D4AF37] font-medium">{formatPrayerTime(prayerTimes[key])}</p>
                )}
                {isCurrentPrayer(label) && (
                  <p className="text-xs text-[#D4AF37] mt-1 font-medium">Now</p>
                )}
                {isCurrentPrayer(label) && currentPrayer === "Fajr" && nextPrayer?.name === "Sunrise" && (
                  <p className="text-xs text-[#D4AF37] mt-1 font-medium">Sunrise in {timeUntilNext}</p>
                )}
                {isNextPrayer(label) && !isCurrentPrayer(label) && (
                  <p className="text-xs text-[#D4AF37] mt-1 font-medium">in {timeUntilNext}</p>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="text-sm text-[#D4AF37] font-medium hover:underline"
          >
            Download Aqala for timely notification →
          </button>
        </div>
      </section>

      {/* Premium banner with countdown */}
      <section className="py-8 md:py-12 bg-gradient-to-r from-[#06402B] to-[#D4AF37] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Best Premium Offer — Only on Web Limited Time Offer!</h2>
          <p className="text-white/95 mb-4">Remove ads. Unlock Quran. Stay consistent.</p>
          <ul className="text-left max-w-xl mx-auto mb-6 space-y-2 text-sm">
            <li>• Ask unlimited questions to our AI bot!</li>
            <li>• Real-time translation for khutbahs and lectures</li>
            <li>• Recite, Learn and Memorise surahs with ease</li>
            <li>• Listen to your favorite Quran reciters offline</li>
            <li>• No ads, no interruptions!</li>
          </ul>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <span className="text-[#D4AF37] font-mono font-bold text-lg tabular-nums">
              {String(countdown.h).padStart(2, "0")} Hr : {String(countdown.m).padStart(2, "0")} Min : {String(countdown.s).padStart(2, "0")} Sec
            </span>
          </div>
          <Link href="/app/special-offer" className="inline-flex px-8 py-4 rounded-lg bg-white text-[#032117] font-bold hover:bg-gray-100 transition-colors">
            Upgrade to Premium
          </Link>
        </div>
      </section>

      {/* Your Prayer and Quran Companion */}
      <section className="py-12 md:py-16 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="quran-companion-image mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/aqala-assets/aqala-quran-premium.jpg"
              alt="Aqala - Prayer and Quran Companion"
              className="max-w-xs mx-auto w-full object-contain rounded-lg"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Your Prayer and Quran Companion</h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Let Aqala guide your day with accurate prayer times, real-time translation for khutbahs and lectures, and meaningful Islamic tools. Get prayer alerts, explore Quran with verse detection, and stay connected with the Ummah across 20+ languages.
          </p>
          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="inline-flex px-8 py-4 rounded-lg bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors"
          >
            Download Free App
          </button>
        </div>
      </section>

      {/* Why Users Trust Aqala */}
      <section className="py-12 md:py-16 bg-[#032117]/50 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center">Why Users Trust Aqala</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_TRUST.map((item) => (
              <div key={item.title} className="mp-card-hover p-6 rounded-2xl bg-[#032117]/[0.05] border border-white/10">
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly table */}
      <section className="py-12 md:py-16 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white mb-4">Prayer times in {cityName} for this week</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 font-semibold text-white">Date</th>
                  <th className="text-left py-3 font-semibold text-white">Date (Hijri)</th>
                  <th className="py-3 font-semibold text-white">Fajr</th>
                  <th className="py-3 font-semibold text-white">Zuhr</th>
                  <th className="py-3 font-semibold text-white">Asr</th>
                  <th className="py-3 font-semibold text-white">Maghrib</th>
                  <th className="py-3 font-semibold text-white">Isha</th>
                </tr>
              </thead>
              <tbody>
                {(weekLoading ? [] : weekData).map((row) => (
                  <tr key={row.date} className="border-b border-white/10">
                    <td className="py-3 text-white/80">{row.date}</td>
                    <td className="py-3 text-white/80">{row.hijri}</td>
                    <td className="py-3 text-center text-white/80">{row.fajr}</td>
                    <td className="py-3 text-center text-white/80">{row.zuhr}</td>
                    <td className="py-3 text-center text-white/80">{row.asr}</td>
                    <td className="py-3 text-center text-white/80">{row.maghrib}</td>
                    <td className="py-3 text-center text-white/80">{row.isha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-white/50 mt-4">See the full calendar in the app</p>
          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="inline-flex mt-6 px-6 py-3 rounded-full bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#b8944d] transition-colors"
          >
            Download Free App
          </button>
        </div>
      </section>

      {/* Recent posts from [country] */}
      <section className="py-12 md:py-16 bg-[#032117]/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-2">Recent posts from {countryName}</h2>
          <div className="space-y-4 mt-6">
            {(RECENT_POSTS_BY_COUNTRY[countryName] ?? RECENT_POSTS_BY_COUNTRY.Australia).map((post) => (
              <article key={post.username} className="flex gap-4 p-4 rounded-2xl bg-white/[0.05] border border-white/10">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-semibold">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <span className="font-semibold text-white">{post.username}</span>
                    <span>{post.time}</span>
                    <span>·</span>
                    <span>{post.location}</span>
                  </div>
                  <p className="text-white/90 text-sm whitespace-pre-line">{post.content}</p>
                </div>
              </article>
            ))}
          </div>
          <Link href="/listen" className="inline-block mt-6 text-[#D4AF37] font-semibold hover:underline">
            Try live translation →
          </Link>
        </div>
      </section>

      {/* Other cities */}
      <section className="py-12 md:py-16 bg-[#032117]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white mb-6">Prayer Times in Other Cities of {countryName}</h2>
          <div className="flex flex-wrap gap-3">
            {(CITIES_BY_COUNTRY[countryName] ?? CITIES_BY_COUNTRY.Australia).map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={async () => {
                  setSearchQuery(`${c.name}, ${c.country}`);
                  setSearching(true);
                  try {
                    const res = await fetch(
                      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${c.name}, ${c.country}`)}&format=json&limit=1`,
                      { headers: { "Accept-Language": "en" } }
                    );
                    const data = await res.json();
                    if (data?.[0]) {
                      const { lat, lon } = data[0];
                      const city = data[0].address?.city || data[0].address?.town || data[0].address?.village || c.name;
                      const country = data[0].address?.country || c.country;
                      setLocationFromSearch(parseFloat(lat), parseFloat(lon), city, country);
                    }
                  } finally {
                    setSearching(false);
                  }
                }}
                disabled={searching}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors text-sm font-medium disabled:opacity-60"
              >
                {c.name} · {c.country}
              </button>
            ))}
          </div>
          <Link href="/app/prayer-times" className="inline-block mt-4 text-[#D4AF37] font-medium hover:underline text-sm">
            Show more cities →
          </Link>
        </div>
      </section>

      {/* Islamic Resources */}
      <section className="py-12 md:py-16 bg-[#032117] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-2">Islamic Resources for Daily Inspiration</h2>
          <p className="text-white/70 mb-8">
            Besides the daily tools like prayer times, Qibla and the Quran, Aqala also produces and shares useful and beneficial Islamic articles, guides and infographics to inspire you to be a better Muslim every day.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <a key={post.title} href={post.href} target="_blank" rel="noopener noreferrer" className="mp-card-hover block p-6 rounded-2xl border border-white/10 hover:border-[#D4AF37]/30 bg-white/[0.03]">
                <h3 className="font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-white/50 mb-4">{post.date}</p>
                <span className="text-[#D4AF37] font-semibold text-sm hover:underline">Read More →</span>
              </a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/app/blog" className="text-[#D4AF37] font-semibold hover:underline">
              Read the Aqala blog
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Event */}
      <section className="py-12 md:py-16 bg-[#032117]/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-white/50 mb-2">Upcoming Islamic Event</p>
          <h2 className="text-xl font-bold text-white mb-2">Eid-Ul-Fitr (~) in {countryName}</h2>
          <p className="text-white/70">Friday, 20 March 2026 | 1 Shawwal 1447</p>
          <Link href="/app/islamic-calendar" className="inline-block mt-4 text-[#D4AF37] font-medium hover:underline text-sm">
            Show more Special Islamic Days →
          </Link>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="py-12 md:py-16 bg-[#032117] border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b border-white/10 pb-6">
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between text-left font-bold text-white mb-2 hover:text-[#D4AF37] transition-colors"
                >
                  <span>{item.q}</span>
                  <svg className={`w-5 h-5 shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && <p className="text-white/70 text-sm">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO section */}
      <section className="py-12 bg-[#021a12]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-white/70 space-y-4">
          <h2 className="font-bold text-white">Prayer Times Today in {cityName}</h2>
          <p>
            Looking for Today&apos;s Prayer Times in {locationLabel}? Here are today&apos;s {cityName}, {countryName} Prayer times: Fajar Prayer Time {prayerTimes ? formatPrayerTime(prayerTimes.fajr) : "--:--"}, Dhuhur Prayer Time {prayerTimes ? formatPrayerTime(prayerTimes.dhuhr) : "--:--"}, Asr Prayer Time {prayerTimes ? formatPrayerTime(prayerTimes.asr) : "--:--"}, Maghrib Prayer Time {prayerTimes ? formatPrayerTime(prayerTimes.maghrib) : "--:--"}, and Isha Prayer Time {prayerTimes ? formatPrayerTime(prayerTimes.isha) : "--:--"}. This is for Islamic prayer timing in {locationLabel}. Daily Islamic Salah Time helps the Muslim ummah to connect with Islam. Find the correct Azan Times and Namaz times, including weekly Salat timings and a detailed monthly Salat timetable.
          </p>
          <p>
            Praying five times a day (Salat) is a key part of being a Muslim, especially during Ramadan. You can learn Iftar Dua and Sehri Dua, feel closer to Allah (SWT) and find peace. It&apos;s also important to know the correct iftar time today and sehri time today so you can keep your fast properly during this blessed month. Today&apos;s Sehri Time {locationLabel}: {prayerTimes ? formatPrayerTime(getImsakTime(prayerTimes.fajr)) : "--:--"} and today&apos;s iftar time {locationLabel}: {prayerTimes ? formatPrayerTime(prayerTimes.maghrib) : "--:--"}.
          </p>
          <p>
            Here you can find the complete prayer timetable for the whole year in {cityName}. The {cityName} Prayer Times is updated daily, ensuring that you always have the most accurate salat timing. The prayer times customization feature allows you to modify timings based on your country&apos;s calculation methods, suitable for Hanafi, Shafi, Maliki, and Hanbali practices.
          </p>
        </div>
      </section>
    </>
  );
}
