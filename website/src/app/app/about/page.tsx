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
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Aqala | About Us
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            At Aqala, we focus on connecting Muslims through comprehension. We provide real-time translation and essential Islamic tools — prayer times, Qibla, Quran — so that language is no longer a barrier to understanding and engaging with Islamic content.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Islamic App Companion</h2>
          <p className="text-gray-600 mb-8">
            Aqala helps Muslims across the world access accurate prayer times, find the Qibla direction, and understand the Qur&apos;an, khutbahs, and lectures in real time — in 20+ languages. Whether you&apos;re listening to a sermon in Arabic or exploring a lecture, Aqala translates spoken Islamic content into clear meaning, anytime, anywhere.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-8">The Journey of Aqala</h2>
          <div className="space-y-8">
            {TIMELINE.map((item) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex-shrink-0 w-24 font-bold text-[#D4AF37]">{item.year}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
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
