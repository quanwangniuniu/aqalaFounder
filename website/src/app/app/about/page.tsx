"use client";

import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

export default function MuslimProAboutPage() {
  return (
    <>
      <MuslimProAppBar />
      <section className="py-16 md:py-24 bg-[#032117] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Aqala | About Us
          </h1>
          <div className="space-y-12 md:space-y-16 max-w-5xl mx-auto">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-4">
                Our Mission: Clarity for the Heart, Direction for the Soul
              </h2>
              <p className="text-white/80 leading-relaxed max-w-4xl mx-auto">
                Aqala is fueled by a relentless team of visionaries, seekers, and innovators who believe that faith
                should never be a mystery. We are driven by a singular, urgent purpose: to empower Muslims everywhere
                to practice their Deen with <strong className="text-white">unwavering intentionality, clarity and deep purpose</strong>, no matter where their
                journey takes them.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-5 md:mb-6">
                Why We Exist
              </h2>
              <div className="space-y-6 text-white/80 leading-relaxed max-w-4xl mx-auto">
                <p>For too long, language and distance have been barriers to true understanding.</p>
                <p>With today&apos;s technology, why can&apos;t we understand anyone, anywhere around the world?</p>
                <p>
                  We refuse to accept a world where believers &ldquo;follow blindly&rdquo; simply because a translation was
                  missing or a direction was unclear. We&apos;ve seen the fog of confusion that settles when you can&apos;t
                  understand the Friday Khutbah or when you feel disconnected from the sacred text in a new land.
                </p>
                <p className="text-white font-semibold pt-5 md:pt-7 border-t border-white/10">That ends with Aqala.</p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-5 md:mb-6">
                Our Commitment to You
              </h2>
              <div className="space-y-6 text-white/80 leading-relaxed max-w-4xl mx-auto">
                <p>
                  We are clearing the fog. We are tearing down the walls between the message and the listener. We
                  don&apos;t just build tools; we build bridges, serving communities connected by one common ground.
                </p>
                <p className="text-white font-semibold">Islam.</p>
                <p>
                  By combining cutting-edge technology with a deep respect for Islamic tradition, we empower the global
                  Ummah to move from passive listening to active reflection.
                </p>
                <p>
                  We aren&apos;t just helping you find the Qibla or translate a lecture; we are helping you find your
                  center. To move with intent & clarity. We are building a future where every Muslim, in every corner
                  of the globe, has the wisdom to lead a life of meaning.
                </p>
                <p className="text-white font-semibold">
                  Because faith isn&apos;t just about what you do-it&apos;s about what you understand.
                </p>
                <p className="text-[#D4AF37] font-semibold text-lg pt-6 md:pt-8 border-t border-white/10">
                  Aqala - Connecting Through Comprehension.
                </p>
              </div>
            </section>
          </div>

          <div className="text-center">
            <Link href="/app" className="inline-flex mt-12 px-6 py-3 rounded-full bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#b8944d]">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
