"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePrayer } from "@/contexts/PrayerContext";
import { formatPrayerTime, getImsakTime } from "@/lib/prayer/calculations";
import DownloadModal from "@/components/muslimpro-replica/DownloadModal";

const PRAYER_ORDER = [
  { key: "fajr" as const, label: "Fajr", icon: "/muslimpro-demo/fajr.svg" },
  { key: "dhuhr" as const, label: "Zuhr", icon: "/muslimpro-demo/zuhr.svg" },
  { key: "asr" as const, label: "Asr", icon: "/muslimpro-demo/asr.svg" },
  { key: "maghrib" as const, label: "Maghrib", icon: "/muslimpro-demo/magrib.svg" },
  { key: "isha" as const, label: "Isha", icon: "/muslimpro-demo/isha.svg" },
];

const WEEK_MOCK = [
  { date: "Sun, Mar 08", hijri: "18, Ram", fajr: "05:24", zuhr: "01:11", asr: "04:29", maghrib: "07:26", isha: "08:56" },
  { date: "Mon, Mar 09", hijri: "19, Ram", fajr: "05:26", zuhr: "01:10", asr: "04:28", maghrib: "07:24", isha: "08:54" },
  { date: "Tue, Mar 10", hijri: "20, Ram", fajr: "05:27", zuhr: "01:10", asr: "04:28", maghrib: "07:22", isha: "08:52" },
  { date: "Wed, Mar 11", hijri: "21, Ram", fajr: "05:28", zuhr: "01:10", asr: "04:27", maghrib: "07:21", isha: "08:51" },
  { date: "Thu, Mar 12", hijri: "22, Ram", fajr: "05:29", zuhr: "01:10", asr: "04:26", maghrib: "07:19", isha: "08:49" },
  { date: "Fri, Mar 13", hijri: "23, Ram", fajr: "05:30", zuhr: "01:10", asr: "04:26", maghrib: "07:18", isha: "08:48" },
  { date: "Sat, Mar 14", hijri: "24, Ram", fajr: "05:31", zuhr: "01:10", asr: "04:25", maghrib: "07:17", isha: "08:47" },
];

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
  Australia: [
    { username: "asifzidan1Hj", time: "1d", location: "Australia", content: "Allahumma innaka 'afuwwun tuhibbul 'afwa fafuanni.\n#LaylathulQadr Mubarak 🌒", avatar: "A" },
    { username: "zinetamanSHX", time: "3d", location: "Australia", content: "Aselamualykum brother's and sister's remember me in your prayers strangers dua is the best here is mine for you May Allah accept all of your prayers and wishes ya Rabb may Allah bless you the best thing in this world and the hereafter ya Rahmman amin", avatar: "Z" },
    { username: "zarinazari", time: "6d", location: "Australia", content: "As salamu alaykum brothers and sisters. Recently I have been facing a lot of health issues and I find myself struggling. Doctors are unable to find the cause of everything happening to me. Please make dua for me as I make dua for the ummah.", avatar: "Z" },
    { username: "toheeratayomideLIvS", time: "7d", location: "Australia", content: "Al-Bayhaqi, Qunoot in the Witr prayer O Allah, You alone do we worship and to You we pray and bow down prostrate. To You we...", avatar: "T" },
  ],
  Netherlands: [
    { username: "sabrien", time: "2h", location: "Netherlands", content: "Salam Aleykum. My niece has autism, she is 8 years old and can speak but not that well. She has also not been going to school because it became to overstimulating for her. Do you please want to make dua for her so everything will be easier for her🤍", avatar: "S" },
    { username: "aimenTaa", time: "2d", location: "Netherlands", content: "Assalamu Alaikum, I am suffering from a debilitating illness, please make dua for me may Allah reward you", avatar: "A" },
    { username: "liambayattBP", time: "5d", location: "Netherlands", content: "School", avatar: "L" },
    { username: "Piousthoughts", time: "01/03/2026", location: "Netherlands", content: "Een prachtige dua voor onze Ummah! Moge Allah SWT ons allen beschermen, leiden en onze imaan versterken. Laten we samen bidden voor eenheid en kracht. In Shaa Allah wordt alles wat zich in jullie harten bevindt vervuld! Waarnaar verlangd wordt", avatar: "P" },
  ],
};

const BLOG_POSTS = [
  { title: "What Actually Happens on Laylat al-Qadr?", date: "March 12, 2026", href: "https://www.muslimpro.com/what-actually-happens-on-laylat-al-qadr/" },
  { title: "What to Expect from the Last 10 Nights of Ramadan", date: "March 10, 2026", href: "https://www.muslimpro.com/what-to-expect-from-the-last-ten-nights-of-ramadan/" },
  { title: "How Do You Perform I'tikaf Correctly During Ramadan?", date: "March 10, 2026", href: "https://www.muslimpro.com/how-to-perform-itikaf-during-ramadan/" },
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
  const { prayerTimes, nextPrayer, currentPrayer, timeUntilNext, loading, location, setLocationFromSearch } = usePrayer();
  const locationLabel = location?.city && location?.country ? `${location.city}, ${location.country}` : "Sydney, Australia";
  const cityName = location?.city || "Sydney";
  const countryName = location?.country || "Australia";

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const countdown = usePremiumCountdown();

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

      {/* Get Muslim Pro CTA */}
      <div className="bg-[#0a5c3e] text-white py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg">Get Muslim Pro</span>
            <span className="text-white/90">Free to Download</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="px-6 py-2 rounded-lg bg-white text-[#0a5c3e] font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Muslim Pro
          </button>
        </div>
      </div>

      {/* Banner hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a5c3e]/5 to-transparent">
        <div className="absolute inset-0 opacity-5">
          <img src="/muslimpro-demo/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
            <Link href="/muslimpro-demo" className="hover:text-[#00a651]">Home</Link>
            {" > "}
            <Link href="/muslimpro-demo/prayer-times" className="hover:text-[#00a651]">Prayer Times</Link>
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
            Saturday, 14 March 2026 | 24 Ramadan 1447
          </p>
          <p className="text-sm text-gray-500 mb-2">Muslim World League (MWL)</p>
          <p className="text-sm text-gray-500 mb-6">
            Imsak {prayerTimes ? formatPrayerTime(getImsakTime(prayerTimes.fajr)) : "--:--"} | Iftar {prayerTimes ? formatPrayerTime(prayerTimes.maghrib) : "--:--"}
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
          <Link href="/muslimpro-demo/special-offer" className="inline-flex px-8 py-4 rounded-lg bg-white text-[#00a651] font-bold hover:bg-gray-100 transition-colors">
            Upgrade to Premium
          </Link>
        </div>
      </section>

      {/* Your Prayer and Quran Companion */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="quran-companion-image mb-8">
            <img
              src="/muslimpro-demo/phone-mockups/Immerse-in-the-Holy-Quran.png"
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
                {WEEK_MOCK.map((row) => (
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
          <Link href="/muslimpro-demo/ummah-pro" className="inline-block mt-6 text-[#00a651] font-semibold hover:underline">
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
                {c.name} {c.country}
              </button>
            ))}
          </div>
          <Link href="/muslimpro-demo/prayer-times" className="inline-block mt-4 text-[#00a651] font-medium hover:underline text-sm">
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
            <Link href="/muslimpro-demo/blog" className="text-[#00a651] font-semibold hover:underline">
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
          <p className="text-gray-600">Saturday, 21 March 2026 | 1 Shawwal 1447</p>
          <Link href="/muslimpro-demo/islamic-calendar" className="inline-block mt-4 text-[#00a651] font-medium hover:underline text-sm">
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
