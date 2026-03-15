"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePrayer } from "@/contexts/PrayerContext";
import { formatPrayerTime, getImsakTime, getMethodName } from "@/lib/prayer/calculations";
import { fetchCalendarWeek, type CalendarDay } from "@/lib/prayer/calendar";
import DownloadModal from "@/components/muslimpro-replica/DownloadModal";

// Method display name by country (1:1 Muslim Pro - Spain uses Basque Country)
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
    { username: "samqh02Q", time: "1h", location: "United States", content: "🇵🇸 Share a simple du'a for Palestine. 👇", avatar: "S" },
    { username: "ibrahimlaoualiHEk", time: "2h", location: "United States", content: "J'ai besoin des vos prières mes frères et sœurs en l'islam, qu'Allah mes facilite les épreuves. Ya rabbi", avatar: "I" },
    { username: "Yasminee4Eva", time: "2h", location: "United States", content: "May Allah Bless us all and protect us from fitnah. Ameen", avatar: "Y" },
    { username: "salieujallohnDUB", time: "5h", location: "United States", content: "God is great", avatar: "S" },
  ],
  Australia: [
    { username: "asifzidan1Hj", time: "1d", location: "Australia", content: "Allahumma innaka 'afuwwun tuhibbul 'afwa fafuanni.\n#LaylathulQadr Mubarak 🌒", avatar: "A" },
    { username: "zinetamanSHX", time: "3d", location: "Australia", content: "Aselamualykum brother's and sister's remember me in your prayers strangers dua is the best here is mine for you May Allah accept all of your prayers and wishes ya Rabb may Allah bless you the best thing in this world and the hereafter ya Rahmman amin", avatar: "Z" },
    { username: "zarinazari", time: "6d", location: "Australia", content: "As salamu alaykum brothers and sisters. Recently I have been facing a lot of health issues and I find myself struggling. Doctors are unable to find the cause of everything happening to me. Please make dua for me as I make dua for the ummah.", avatar: "Z" },
    { username: "toheeratayomideLIvS", time: "7d", location: "Australia", content: "Al-Bayhaqi, Qunoot in the Witr prayer O Allah, You alone do we worship and to You we pray and bow down prostrate. To You we...", avatar: "T" },
  ],
  Spain: [
    { username: "ahmed_madrid", time: "3h", location: "Spain", content: "Ramadan Mubarak to all! May Allah accept our fasts and prayers. 🤲", avatar: "A" },
    { username: "fatima_bcn", time: "5h", location: "Spain", content: "Beautiful Taraweeh at the mosque tonight. Alhamdulillah.", avatar: "F" },
    { username: "omar_valencia", time: "1d", location: "Spain", content: "Making dua for our brothers and sisters in Palestine. Ya Rabb, ease their suffering.", avatar: "O" },
    { username: "sara_sevilla", time: "2d", location: "Spain", content: "Last 10 nights of Ramadan - let's make the most of it! Laylat al-Qadr could be any of these nights.", avatar: "S" },
  ],
  Canada: [
    { username: "lailamelbaz", time: "6h", location: "Canada", content: "السلام عليكم ورحمة الله وبركاته", avatar: "L" },
    { username: "Saadali", time: "15h", location: "Canada", content: "My father recently had a surgery. I kindly request you all to please remember him in your prayers. May Allah grant Mirza Sabir complete shifa and bless him with a long, healthy life. Ameen. 🤲 JazakAllah Khair.", avatar: "S" },
    { username: "lailamelbaz", time: "1d", location: "Canada", content: "The last friday of this blessed month… take advantage of it and make dua to allah to increase your imaan and not let us succumb to the whispers of shaytan even after this month is over", avatar: "L" },
    { username: "shafaqmirza8Ur", time: "1d", location: "Canada", content: "Feeling blessed today because: 😊 have got the blessed night of 25th Ramadan.", avatar: "S" },
  ],
  Germany: [
    { username: "ahmed_berlin", time: "2h", location: "Germany", content: "Ramadan Kareem to everyone! May this month bring peace and barakah. 🤲", avatar: "A" },
    { username: "fatima_muc", time: "5h", location: "Germany", content: "Alhamdulillah for another day of fasting. Making dua for the Ummah worldwide.", avatar: "F" },
    { username: "omar_hh", time: "1d", location: "Germany", content: "Last 10 nights - let's seek Laylat al-Qadr. May Allah accept our worship.", avatar: "O" },
    { username: "sara_ffm", time: "2d", location: "Germany", content: "Beautiful community at the mosque tonight. JazakAllah khair to all volunteers.", avatar: "S" },
  ],
  Netherlands: [
    { username: "sabrien", time: "2h", location: "Netherlands", content: "Salam Aleykum. My niece has autism, she is 8 years old and can speak but not that well. She has also not been going to school because it became to overstimulating for her. Do you please want to make dua for her so everything will be easier for her🤍", avatar: "S" },
    { username: "aimenTaa", time: "2d", location: "Netherlands", content: "Assalamu Alaikum, I am suffering from a debilitating illness, please make dua for me may Allah reward you", avatar: "A" },
    { username: "liambayattBP", time: "5d", location: "Netherlands", content: "School", avatar: "L" },
    { username: "Piousthoughts", time: "01/03/2026", location: "Netherlands", content: "Een prachtige dua voor onze Ummah! Moge Allah SWT ons allen beschermen, leiden en onze imaan versterken. Laten we samen bidden voor eenheid en kracht. In Shaa Allah wordt alles wat zich in jullie harten bevindt vervuld! Waarnaar verlangd wordt", avatar: "P" },
  ],
};

const BLOG_POSTS = [
  { title: "What Actually Happens on Laylat al-Qadr?", date: "March 12, 2026", href: "/app/blog" },
  { title: "What to Expect from the Last 10 Nights of Ramadan", date: "March 10, 2026", href: "/app/blog" },
  { title: "How Do You Perform I'tikaf Correctly During Ramadan?", date: "March 10, 2026", href: "/app/blog" },
];

const FAQ = [
  { a: "Prayer times are calculated based on your location using the Muslim World League (MWL) method by default. You can switch to other recognized methods (e.g. Umm al-Qura, ISNA, Egyptian, etc.) under Settings. GPS ensures accuracy, and you can also manually adjust the timing to align with your local mosque if needed." },
  { a: "Suhoor ends at the start of Fajr and Iftar begins at Maghrib. These times are automatically updated every day based on your exact location and appear clearly under the Ramadan section of the platform. You can also enable daily fasting reminders to stay notified." },
  { q: "Can I get reminders for each prayer?", a: "Yes, you can receive Adhan notifications for each prayer time. Go to Settings > Notifications, and choose the specific prayers you'd like alerts for. You can even customize the Adhan voice from a list of renowned muezzins." },
  { q: "How do I track my missed fasts or prayers?", a: "The Ibadah Tracker helps you log missed prayers (Qada') and fasts so you can easily keep track and plan your make-up days. You can mark each one as completed when done, and even view weekly or monthly progress summaries." },
  { q: "What is the AI assistant and how can I use it?", a: "The AI assistant is your personalized Islamic companion that supports you through Ramadan and throughout the year. It helps answer your questions about prayers, fasting, duas, and Islamic rulings, while also offering personalized guidance based on your goals and habits." },
  { q: "Can my kids and children use the platform safely?", a: "Yes, the platform is designed to be safe and family-friendly for children. It features a dedicated collection of Islamic educational videos, stories, and animations that are carefully curated to be age-appropriate, engaging, and free from distractions or harmful content." },
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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a5c3e]/5 to-transparent">
        <div className="absolute inset-0 opacity-5">
          <img src="/app/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
            <Link href="/app" className="hover:text-[#00a651]">Home</Link>
            {" > "}
            <Link href="/app/prayer-times" className="hover:text-[#00a651]">Prayer Times</Link>
            {" > "}
            <span className="text-gray-600">World</span>
            {" > "}
            <span className="text-gray-600">{countryName}</span>
            {" > "}
            <span className="text-gray-900 font-medium">{cityName}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 outline-none transition-colors"
              aria-label="Search for a city"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2.5 rounded-lg bg-[#00a651] text-white font-medium hover:bg-[#008f44] disabled:opacity-60 transition-colors"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} | {todayHijri || "— Ramadan 1447"}
          </p>
          <p className="text-sm text-gray-500 mb-2">{getMethodDisplayName(countryName, settings.method)}</p>
          <p className="text-sm text-gray-500 mb-6">
            Sehri {prayerTimes ? formatPrayerTime(getImsakTime(prayerTimes.fajr)) : "--:--"} | Iftar {prayerTimes ? formatPrayerTime(prayerTimes.maghrib) : "--:--"}
          </p>

          {/* Today's times with icons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {PRAYER_ORDER.map(({ key, label, icon }) => (
              <div key={key} className="mp-card-hover text-center p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <img src={icon} alt={`${label} icon`} className="w-10 h-10 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-gray-900 mb-1">{label}</p>
                {loading || !prayerTimes ? (
                  <p className="text-gray-400">--:--</p>
                ) : (
                  <p className="text-[#00a651] font-medium">{formatPrayerTime(prayerTimes[key])}</p>
                )}
                {isCurrentPrayer(label) && (
                  <p className="text-xs text-[#00a651] mt-1 font-medium">Now</p>
                )}
                {isCurrentPrayer(label) && currentPrayer === "Fajr" && nextPrayer?.name === "Sunrise" && (
                  <p className="text-xs text-[#00a651] mt-1 font-medium">Sunrise in {timeUntilNext}</p>
                )}
                {isNextPrayer(label) && !isCurrentPrayer(label) && (
                  <p className="text-xs text-[#00a651] mt-1 font-medium">in {timeUntilNext}</p>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="text-sm text-[#00a651] font-medium hover:underline"
          >
            Download Muslim Pro for timely notification →
          </button>
        </div>
      </section>

      {/* Premium banner with countdown */}
      <section className="py-8 md:py-12 bg-gradient-to-r from-[#0a5c3e] to-[#00a651] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Best Premium Offer — Only on Web Limited Time Offer!</h2>
          <p className="text-white/95 mb-4">Remove ads. Unlock Quran. Stay consistent.</p>
          <ul className="text-left max-w-xl mx-auto mb-6 space-y-2 text-sm">
            <li>• Ask unlimited questions to our AI bot!</li>
            <li>• Access thousands of hours of Muslim films, TV series and more</li>
            <li>• Recite, Learn and Memorise surahs with ease</li>
            <li>• Listen to your favorite Quran reciters offline</li>
            <li>• No ads, no interruptions!</li>
          </ul>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <span className="text-[#00a651] font-mono font-bold text-lg tabular-nums">
              {String(countdown.h).padStart(2, "0")} Hr : {String(countdown.m).padStart(2, "0")} Min : {String(countdown.s).padStart(2, "0")} Sec
            </span>
          </div>
          <Link href="/app/special-offer" className="inline-flex px-8 py-4 rounded-lg bg-white text-[#00a651] font-bold hover:bg-gray-100 transition-colors">
            Upgrade to Premium
          </Link>
        </div>
      </section>

      {/* Your Prayer and Quran Companion */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="quran-companion-image mb-8">
            <img
              src="/app/phone-mockups/Immerse-in-the-Holy-Quran.png"
              alt="Muslim Pro - Prayer and Quran Companion"
              className="max-w-xs mx-auto w-full object-contain"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Your Prayer and Quran Companion</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Let Muslim Pro guide your day with accurate prayer times, beautiful Quran recitations, and meaningful Islamic reminders. Get real-time Adhan alerts, track your ibadah, ask our AI assistant, and stay inspired every step of the way.
          </p>
          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors"
          >
            Download Free App
          </button>
        </div>
      </section>

      {/* Why Millions Trust Muslim Pro */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">Why Millions Trust Muslim Pro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_TRUST.map((item) => (
              <div key={item.title} className="mp-card-hover p-6 rounded-2xl bg-white border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly table */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Prayer times in {cityName} for this week</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 font-semibold text-gray-900">Date (Hijri)</th>
                  <th className="py-3 font-semibold text-gray-900">Fajr</th>
                  <th className="py-3 font-semibold text-gray-900">Zuhr</th>
                  <th className="py-3 font-semibold text-gray-900">Asr</th>
                  <th className="py-3 font-semibold text-gray-900">Maghrib</th>
                  <th className="py-3 font-semibold text-gray-900">Isha</th>
                </tr>
              </thead>
              <tbody>
                {(weekLoading ? [] : weekData).map((row) => (
                  <tr key={row.date} className="border-b border-gray-100">
                    <td className="py-3 text-gray-700">{row.date}</td>
                    <td className="py-3 text-gray-700">{row.hijri}</td>
                    <td className="py-3 text-center">{row.fajr}</td>
                    <td className="py-3 text-center">{row.zuhr}</td>
                    <td className="py-3 text-center">{row.asr}</td>
                    <td className="py-3 text-center">{row.maghrib}</td>
                    <td className="py-3 text-center">{row.isha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">See the full calendar in the app</p>
          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="inline-flex mt-6 px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors"
          >
            Download Free App
          </button>
        </div>
      </section>

      {/* Recent posts from [country] */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent posts from {countryName}</h2>
          <div className="space-y-4 mt-6">
            {(RECENT_POSTS_BY_COUNTRY[countryName] ?? RECENT_POSTS_BY_COUNTRY.Australia).map((post) => (
              <article key={post.username} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-200">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#0a5c3e]/10 flex items-center justify-center text-[#0a5c3e] font-semibold">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <span className="font-semibold text-gray-900">{post.username}</span>
                    <span>{post.time}</span>
                    <span>·</span>
                    <span>{post.location}</span>
                  </div>
                  <p className="text-gray-800 text-sm whitespace-pre-line">{post.content}</p>
                </div>
              </article>
            ))}
          </div>
          <Link href="/app/ummah" className="inline-block mt-6 text-[#00a651] font-semibold hover:underline">
            View more on Ummah Pro
          </Link>
        </div>
      </section>

      {/* Other cities */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Prayer Times in Other Cities of {countryName}</h2>
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
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-[#00a651] hover:text-[#00a651] transition-colors text-sm font-medium disabled:opacity-60"
              >
                {c.name}{c.country}
              </button>
            ))}
          </div>
          <Link href="/app/prayer-times" className="inline-block mt-4 text-[#00a651] font-medium hover:underline text-sm">
            Show more cities →
          </Link>
        </div>
      </section>

      {/* Islamic Resources */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Islamic Resources for Daily Inspiration</h2>
          <p className="text-gray-600 mb-8">
            Besides the daily tools like prayer times, Qibla and the Quran, Muslim Pro also produces and shares useful and beneficial Islamic articles, guides and infographics to inspire you to be a better Muslim every day.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <a key={post.title} href={post.href} target="_blank" rel="noopener noreferrer" className="mp-card-hover block p-6 rounded-2xl border border-gray-200 hover:border-[#00a651]/30">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{post.date}</p>
                <span className="text-[#00a651] font-semibold text-sm hover:underline">Read More →</span>
              </a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/app/blog" className="text-[#00a651] font-semibold hover:underline">
              Read the Muslim Pro blog
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Event */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 mb-2">Upcoming Islamic Event</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Eid-Ul-Fitr (~) in {countryName}</h2>
          <p className="text-gray-600">Friday, 20 March 2026 | 1 Shawwal 1447</p>
          <Link href="/app/islamic-calendar" className="inline-block mt-4 text-[#00a651] font-medium hover:underline text-sm">
            Show more Special Islamic Days →
          </Link>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b border-gray-200 pb-6">
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between text-left font-bold text-gray-900 mb-2 hover:text-[#00a651] transition-colors"
                >
                  <span>{item.q}</span>
                  <svg className={`w-5 h-5 shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && <p className="text-gray-600 text-sm">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-600 space-y-4">
          <h2 className="font-bold text-gray-900">Prayer Times Today in {cityName}</h2>
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
