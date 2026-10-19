import { Loader } from "@/components/Loader";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/hero/Hero";
import { Destinations } from "@/components/destinations/Destinations";
import { Places } from "@/components/places/Places";
import { TripFinder } from "@/components/finder/TripFinder";
import { WhyMeridian } from "@/components/why/WhyMeridian";
import { Stories } from "@/components/stories/Stories";
import { Testimonials } from "@/components/reviews/Testimonials";
import { FAQ } from "@/components/faq/FAQ";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { Footer } from "@/components/footer/Footer";
import { JourneyModal } from "@/components/journey/JourneyModal";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Meridian",
  slogan: "Journeys, curated.",
  description: "Private, tailor-made journeys to Santorini, Kyoto, Marrakech, Bali, Patagonia, Reykjavík, the Amalfi Coast and Cappadocia.",
  email: "hello@meridian-travel.example",
  telephone: "+44 20 7946 0123",
  areaServed: "Worldwide",
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Loader />
      <Nav />
      <main>
        <Hero />
        <Destinations />
        <Places />
        <TripFinder />
        <WhyMeridian />
        <Stories />
        <Testimonials />
        <FAQ />
        <InquiryForm />
      </main>
      <Footer />
      <JourneyModal />
    </>
  );
}
