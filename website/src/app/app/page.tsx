"use client";

import MuslimProHero from "@/components/muslimpro-replica/MuslimProHero";
import MuslimProIntro from "@/components/muslimpro-replica/MuslimProIntro";
import MuslimProHomeCarousel from "@/components/muslimpro-replica/MuslimProHomeCarousel";
import MuslimProHomeSections from "@/components/muslimpro-replica/MuslimProHomeSections";
import MuslimProStats from "@/components/muslimpro-replica/MuslimProStats";
import MuslimProComparisonSection from "@/components/muslimpro-replica/MuslimProComparisonSection";
import MuslimProHomeTestimonial from "@/components/muslimpro-replica/MuslimProHomeTestimonial";
import MuslimProNewsletter from "@/components/muslimpro-replica/MuslimProNewsletter";
import MuslimProDownloadSection from "@/components/muslimpro-replica/MuslimProDownloadSection";
import MuslimProScrollReveal from "@/components/muslimpro-replica/MuslimProScrollReveal";
import MuslimProQuranDetectionSection from "@/components/muslimpro-replica/MuslimProQuranDetectionSection";
import MuslimProHelpCenterSection from "@/components/muslimpro-replica/MuslimProHelpCenterSection";
import MuslimProContactSection from "@/components/muslimpro-replica/MuslimProContactSection";

/**
 * Aqala /app — marketing home
 */
export default function MuslimProDemoPage() {
  return (
    <>
      <MuslimProHero />
      <MuslimProScrollReveal>
        <MuslimProIntro />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProHomeCarousel />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProHomeSections />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProQuranDetectionSection />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProComparisonSection />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProStats />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProDownloadSection />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProHomeTestimonial />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProHelpCenterSection />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProContactSection />
      </MuslimProScrollReveal>
      <MuslimProScrollReveal>
        <MuslimProNewsletter />
      </MuslimProScrollReveal>
    </>
  );
}
