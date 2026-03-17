"use client";

import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import MuslimProNewsletter from "@/components/muslimpro-replica/MuslimProNewsletter";

const RAMADAN_ARTICLES = [
  { title: "Laylat al-Qadr: When the Heavens Open", date: "March 12, 2026", excerpt: "One night worth a thousand months. A practical guide to seeking this blessed night.", href: "/app/blog/laylat-al-qadr" },
  { title: "Ramadan's Final Ten Nights: A Practical Guide", date: "March 11, 2026", excerpt: "Not about pushing limits — about showing up tired, busy, and human.", href: "/app/blog/last-10-nights" },
  { title: "I'tikaf: Stepping Back to Reconnect", date: "March 10, 2026", excerpt: "When the world feels too loud, retreat into the mosque. A step-by-step guide.", href: "/app/blog/itikaf-during-ramadan" },
  { title: "When Ramadan Feels Flat: What's Really Going On", date: "March 6, 2026", excerpt: "The mid-Ramadan slump isn't failure. Understanding the spiritual rhythm.", href: "/app/blog/heart-feels-tired" },
  { title: "Dhikr You Can Do Anywhere This Ramadan", date: "March 3, 2026", excerpt: "Short, powerful remembrances for commutes, breaks, and quiet moments.", href: "/app/blog/simple-ramadan-dhikr" },
  { title: "Finishing the Quran in 30 Days: The Four-Page Method", date: "March 2, 2026", excerpt: "A simple daily target that adds up. How to pace yourself without burnout.", href: "/app/blog/four-page-rule" },
];

export default function RamadanGuidePage() {
  return (
    <>
      <MuslimProAppBar />
      <article className="bg-white">
        <header className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Ramadan 2026 Guide: Fasting Times, Iftar Dua, Ramadan Greetings
            </h1>
            <div className="flex flex-wrap gap-6 text-gray-600 mb-8">
              <span className="flex items-center gap-2">
                <span className="text-lg">🌙</span> First Day of Ramadan: February 18-19, 2026
              </span>
              <span className="flex items-center gap-2">
                <span className="text-lg">✨</span> Laylat al-Qadr: March 15-16, 2026
              </span>
              <span className="flex items-center gap-2">
                <span className="text-lg">🎉</span> Eid al-Fitr: March 20-21, 2026
              </span>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-10 text-gray-700 leading-relaxed">
          <p>
            Ramadan 2026 (1447H) has officially begun, marking a sacred period of fasting, prayer, and community for over two billion Muslims worldwide. Because the Islamic calendar is lunar, the Ramadan 2026 start date varied slightly across different regions based on the local sighting of the crescent moon (hilal). For most of the world, the first day of fasting for Ramadan 1447 fell on either February 18 or February 19, 2026. The holy month will conclude with the joyous celebration of Eid al-Fitr on March 20-21, 2026.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Official Ramadan 2026 Start Dates</h2>
            <p className="mb-4">
              While Ramadan 2026 is now underway, the start date varied by region based on local moon-sighting traditions. Below are the confirmed dates:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Country</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Ramadan 2026 Start</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 px-4 py-3">United States</td><td className="border border-gray-200 px-4 py-3">Wed, Feb 18, 2026</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-3">United Kingdom</td><td className="border border-gray-200 px-4 py-3">Wed, Feb 18 / Thu, Feb 19</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-3">France</td><td className="border border-gray-200 px-4 py-3">Thu, Feb 19, 2026</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-3">Indonesia</td><td className="border border-gray-200 px-4 py-3">Thu, Feb 19, 2026</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-3">Malaysia</td><td className="border border-gray-200 px-4 py-3">Thu, Feb 19, 2026</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              To find important Islamic dates, accurate prayer times, and Iftar timings for your specific city, you can download the Aqala app for real-time updates throughout the year.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Ramadan?</h2>
            <p>
              Ramadan is the ninth month of the Islamic lunar calendar and is observed by approximately 2 billion Muslims worldwide as a month of fasting, prayer, reflection, and community. It commemorates the first revelation of the Quran to the Prophet Muhammad (peace be upon him) and is considered the most sacred month in Islam.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ramadan Niyyah (Intention)</h2>
            <p className="mb-4">
              In Islam, the validity of deeds rests on intention. Before dawn (often during Suhoor/Sehri/Seheri), it is essential to make the specific intention to fast. While this resolve must exist in the heart, many Muslims articulate it verbally to reaffirm their commitment.
            </p>
            <p className="mb-2 font-medium">The standard supplication for the Niyyah is:</p>
            <p className="mb-2 text-right font-arabic text-xl" dir="rtl">نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى</p>
            <p className="text-gray-600 italic">Nawaitu sauma ghadin &apos;an adā&apos;i fardi shahri Ramadāna hādihis-sanati lillāhi ta&apos;ālā.</p>
            <p className="mt-2">Translation: &quot;I intend to fast tomorrow to perform the obligation of the month of Ramadan this year for the sake of Allah the Almighty.&quot;</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Breaking the Fast (Iftar Dua)</h2>
            <p className="mb-4">
              At sunset, immediately upon hearing the Maghrib call to prayer, Muslims break their fast. It is traditional to do so with dates and water—following the sunnah of the Prophet Muhammad (peace be upon him)—while reciting the Iftar Dua to express gratitude.
            </p>
            <p className="mb-2 font-medium">A widely recited supplication at this time is:</p>
            <p className="mb-2 text-right font-arabic text-xl" dir="rtl">اللَّهُمَّ إِنِّى لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ</p>
            <p className="text-gray-600 italic">Allāhumma inni laka sumtu wa bika āmantu wa &apos;alā rizqika aftartu.</p>
            <p className="mt-2">Translation: &quot;O Allah! I fasted for You, and I believe in You, and I break my fast with Your sustenance.&quot;</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Essential Acts of Worship in Ramadan 2026</h2>
            <p className="mb-6">Maximize the blessings of this holy month by focusing on these key spiritual practices:</p>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-[#00a651] font-bold">•</span>
                <div>
                  <strong>Daily Fasting (Obligatory)</strong> — Abstain from food, drink, and other physical needs from Fajr (dawn) until Maghrib (sunset).
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00a651] font-bold">•</span>
                <div>
                  <strong>Five Daily Prayers</strong> — Maintain your five obligatory prayers on time throughout Ramadan.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00a651] font-bold">•</span>
                <div>
                  <strong>Taraweeh Prayers</strong> — Attend the special nightly prayers performed only during Ramadan.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00a651] font-bold">•</span>
                <div>
                  <strong>Seek Laylat al-Qadr</strong> — The Night of Power is &quot;better than a thousand months.&quot; Search for it in the last 10 nights.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00a651] font-bold">•</span>
                <div>
                  <strong>Khatam Quran</strong> — Aim to complete at least one full recitation during the month.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#00a651] font-bold">•</span>
                <div>
                  <strong>Pay Zakat Al-Fitr</strong> — Obligatory on every Muslim before the Eid prayer.
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Everything You Need to Know About Ramadan 2026</h2>
            <div className="grid gap-6">
              {RAMADAN_ARTICLES.map((a) => (
                <Link key={a.href} href={a.href} className="block p-6 rounded-xl border border-gray-200 hover:border-[#00a651]/30 mp-card-hover">
                  <h3 className="font-bold text-gray-900 mb-1">{a.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{a.date}</p>
                  <p className="text-gray-600 text-sm">{a.excerpt}</p>
                  <span className="inline-block mt-2 text-[#00a651] font-semibold text-sm hover:underline">Read more</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>

      <MuslimProNewsletter />
    </>
  );
}
