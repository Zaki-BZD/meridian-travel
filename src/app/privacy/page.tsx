import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notice for Meridian, a fictional travel agency demo.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      sections={[
        {
          heading: "What we collect",
          body: "When you send an inquiry or join the newsletter, we receive the details you enter: your name, email, travel dates, destination, party size and message.",
        },
        {
          heading: "How it's used",
          body: "Only to reply to you and plan your journey, or to send the newsletter you asked for. We never sell your data. You can unsubscribe at any time.",
        },
        {
          heading: "In this demo",
          body: "Form submissions are written to the server log for demonstration and are not stored in a database or emailed to anyone.",
        },
      ]}
    />
  );
}
