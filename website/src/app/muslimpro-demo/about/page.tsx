"use client";

import Link from "next/link";

const TIMELINE = [
  { year: "2009", title: "Concept & Development", desc: "Muslim Pro was conceived in 2009 with the vision of providing precise Muslim prayer timings for Indonesia's young Muslim population. Muslim Pro had a modest start with just 500 downloads - and Indonesia contributing only five downloads. However, the app found early success among Muslim minorities in the United States and United Kingdom, where Muslim prayer times were less accessible." },
  { year: "2010", title: "Launch", desc: "Muslim Pro debuted on iOS in 2010, followed by an Android version in 2011. This led to its growth in regions with significant Muslim populations, such as the Middle East, North Africa, Southeast Asia, and South Asia, eventually making Muslim Pro the first Muslim prayer time app in the market and one of world's most popular religious apps." },
  { year: "2011-2014", title: "First Million Downloads", desc: "On November 21, 2011, Muslim Pro achieved its first million downloads. As its popularity surged worldwide, the team expanded, adding an Android developer and appointing an executive for business development, marketing, customer support, and analytics." },
  { year: "2017", title: "Acquisitions & Growth", desc: "With 45 million downloads globally, Muslim Pro was acquired by Malaysia's Bintang Capital Partners and Singapore's CMIA Capital Partners. The app received the Islamic Economy Award (Media category) at the Global Islamic Economic Summit 2018, further cementing its position as a leading global Muslim brand." },
  { year: "2021 - 2022", title: "Islamic Content & Resources", desc: "Acknowledging the evolving needs of the modern Muslim, Muslim Pro struck a new vision for itself - to be the Digital Home for All Things Muslim. The app committed itself to expanding its content library with beneficial Islamic articles, infographics, and other resources. In 2022, it launched Qalbox, a Muslim streaming service within the app where Muslims can watch long form Islamic content including films, documentaries, and kids' programmes." },
  { year: "present", title: "Expansion & New Features", desc: "By Ramadan 2024, Muslim Pro has surpassed 180 million downloads, with 25 million monthly and 8 million daily active users. Beyond Islamic utility tools such as the prayer times, Qibla and the Holy Quran, Muslim Pro continues to add beneficial features to champion the Muslim way of life including Quran lessons, Quran memorization tools, AI-powered Islamic chatbot (Ask AiDeen), and much more." },
];

export default function MuslimProAboutPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Muslim Pro | About Us
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            At Muslim Pro, we focus on the everyday Muslim life. We are the digital destination that everyone calls home. We provide religious tools and a rich library of content that support the diverse Muslim community - around the clock, around the world. We are the digital home for all things Muslim.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Islamic App Companion</h2>
          <p className="text-gray-600 mb-8">
            With over 180 million downloads worldwide, Muslim Pro is the most trusted and widely-used Muslim lifestyle app in the world. Since its launch in 2010, Muslim Pro has helped Muslims across the world access accurate prayer times, find the Qibla direction, and utilize essential Islamic tools like the holy Quran seamlessly - anytime, anywhere. Recognized globally for its dedication to the Muslim community, Muslim Pro has earned prestigious accolades such as the Islamic Economy Award at the 2018 Global Islamic Economic Summit and the User Satisfaction Award at the Google APAC App Summit in 2022.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet our Leadership team</h2>
          <p className="text-gray-600 mb-8">
            Muslim Pro is led by a team of passionate and driven leaders who seek to help Muslims all over the world to practise their faith purposefully and intentionally wherever they are and anywhere they go.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-6 rounded-2xl border border-gray-200">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
              <h3 className="font-bold text-gray-900">Nafees Khundker</h3>
              <p className="text-sm text-[#00a651] mb-2">Chief Executive Officer & Group Managing Director</p>
              <p className="text-sm text-gray-600">Nafees is a seasoned leader with over 20 years of experience in Corporate & Investment Banking, having held leadership roles at Deutsche Bank and Standard Chartered across Asia Pacific and the Middle East.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-200">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
              <h3 className="font-bold text-gray-900">Ahmadul Hoq</h3>
              <p className="text-sm text-[#00a651] mb-2">Head of Engineering</p>
              <p className="text-sm text-gray-600">Ahmadul has been with Muslim Pro since its inception and played an important role in the development and growth of the Muslim Pro app.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8">The Journey of Muslim Pro</h2>
          <div className="space-y-8">
            {TIMELINE.map((item) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex-shrink-0 w-24 font-bold text-[#00a651]">{item.year}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/muslimpro-demo" className="inline-flex mt-12 px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
