"use client";

import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

const TIMELINE = [
  { year: "2024", title: "Concept & Vision", desc: "Aqala was conceived with the vision of connecting Muslims through comprehension. Language should not be a barrier to understanding the Qur'an, khutbahs, or Islamic lectures. We set out to build real-time translation for spoken Islamic content." },
  { year: "2025", title: "Launch", desc: "Aqala launched as a web app, offering prayer times, Qibla finder, and real-time translation for Qur'an, khutbahs, and lectures. Users can listen in any language and see translations in 20+ languages." },
  { year: "present", title: "Expansion & New Features", desc: "Aqala continues to add features: Quran verse detection, room-based shared listening, and improved translation. Our goal is to make Islamic knowledge accessible to the global Ummah, regardless of language." },
];

export default function MuslimProAboutPage() {
  return (
    <>
      <MuslimProAppBar />
      <section className="py-16 md:py-24 bg-[#032117] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            Aqala | About Us
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-12 max-w-4xl">
            At Aqala, we focus on connecting Muslims through comprehension. We provide real-time translation and essential Islamic tools — prayer times, Qibla, Quran — so that language is no longer a barrier to understanding and engaging with Islamic content.
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mb-4">Meet our Leadership team</h2>
          <p className="text-white/80 leading-relaxed mb-10 max-w-4xl">
            Aqala is led by a team of passionate and driven leaders who seek to help Muslims all over the world to practise their faith purposefully and intentionally wherever they are and anywhere they go.
          </p>

          <div className="mb-14 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-1">Nafees Khundker</h3>
            <p className="text-[#D4AF37] font-medium text-sm md:text-base mb-4">
              Chief Executive Officer &amp; Group Managing Director
            </p>
            <p className="text-white/75 leading-relaxed">
              Nafees is a seasoned leader with over 20 years of experience in Corporate &amp; Investment Banking, having held leadership roles at Deutsche Bank and Standard Chartered across Asia Pacific and the Middle East. As a Venture Capital Partner and entrepreneur, he has successfully scaled businesses in IT, retail, and finance. Passionate about sustainability, Nafees supports various non-profit organizations and enjoys sports, particularly tennis and cricket.
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-8">The Journey of Aqala</h2>
          <div className="space-y-8">
            {TIMELINE.map((item) => (
              <div key={item.year} className="flex flex-col sm:flex-row gap-3 sm:gap-6 p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="flex-shrink-0 w-24 font-bold uppercase tracking-wide text-[#D4AF37]">{item.year}</div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/75 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/app" className="inline-flex mt-12 px-6 py-3 rounded-full bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#b8944d]">
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
