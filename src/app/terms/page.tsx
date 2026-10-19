import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Booking terms for Meridian, a fictional travel agency demo.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      sections={[
        {
          heading: "Bookings",
          body: "A journey is confirmed once we receive a 25% deposit and send written confirmation. The balance is due 60 days before departure.",
        },
        {
          heading: "Cancellations",
          body: "More than 60 days before departure: deposit refunded minus a $250 planning fee. 60–30 days: 50% refundable. Within 30 days: non-refundable. Supplier terms may differ and are shown before payment.",
        },
        {
          heading: "Insurance",
          body: "Comprehensive travel insurance, including cancellation, medical and evacuation cover, is required for every journey.",
        },
      ]}
    />
  );
}
