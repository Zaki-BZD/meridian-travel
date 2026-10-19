"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSite } from "@/components/providers/Providers";
import { usePrefersReducedMotion } from "@/hooks/useMedia";

const EASE = [0.16, 1, 0.3, 1] as const;

const FAQS = [
  {
    q: "How do booking and deposits work?",
    a: "Once you're happy with your itinerary, we confirm everything with a 25% deposit. The balance is due 60 days before departure. For trips booked within 60 days, we take full payment at booking. You'll receive a detailed confirmation and a single point of contact the same day.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancel more than 60 days before departure and we refund your deposit minus a $250 planning fee. Between 60 and 30 days, 50% of the trip cost is refundable; within 30 days it is non-refundable. Some hotels and flights carry their own terms — we always flag these before you pay.",
  },
  {
    q: "Do I need a visa?",
    a: "It depends on your passport and destination. Your travel designer checks entry requirements for every traveler in your party and sends you the exact steps, forms and timelines. We can also arrange a visa service for countries that need one in advance.",
  },
  {
    q: "Is travel insurance included?",
    a: "Insurance isn't included in our prices, but it is required for every Meridian journey. We recommend comprehensive cover including cancellation, medical and evacuation, and we're happy to suggest specialist providers for adventure trips.",
  },
  {
    q: "How big are the groups?",
    a: "There are no groups. Every Meridian journey is private — just you and the people you choose to travel with. Guides, drivers and experiences are booked exclusively for your party.",
  },
  {
    q: "Do you plan trips for solo travelers?",
    a: "Yes, and we love to. Many of our journeys work beautifully solo, and we can choose hotels with a sociable feel, add a local host for dinners, or keep things entirely quiet. Single supplements are shown upfront.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Bank transfer, all major credit and debit cards, and Apple Pay. Payments are processed securely, and you can split the balance into instalments at no extra cost as long as it's settled 60 days before departure.",
  },
  {
    q: "Can you create a completely custom itinerary?",
    a: "Absolutely — most of our journeys are. The itineraries on this site are starting points. Tell us where you'd like to go, how you like to travel and what you'd rather avoid, and we'll design something from scratch, usually within three working days.",
  },
];

export function FAQ() {
  const { scrollTo } = useSite();
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  const reduced = usePrefersReducedMotion();

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative bg-navy-950 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 sm:text-xs">
            <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
            FAQ
          </p>
          <h2
            id="faq-title"
            className="font-display text-[clamp(2.4rem,5.6vw,5rem)] font-light leading-[1] tracking-[-0.02em] text-sand"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Before you <em className="italic text-gold-300">pack.</em>
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-mist">
            The questions we hear most often. Anything else, ask a person — we reply within one working day.
          </p>
          <a
            href="#inquire"
            onClick={(e) => {
              if (!document.querySelector("#inquire")) return;
              e.preventDefault();
              scrollTo("#inquire");
            }}
            className="group mt-9 inline-flex items-center gap-3 rounded-full border border-gold-400/60 px-6 py-3 text-sm text-gold-300 transition-colors hover:bg-gold-400 hover:text-navy-950"
          >
            Still have questions? Talk to a travel designer
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1">
              <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        </div>

        <ul className="border-t border-white/10">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            const btnId = `${baseId}-q${i}`;
            const panelId = `${baseId}-a${i}`;
            return (
              <li key={item.q} className="border-b border-white/10">
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
                  >
                    <span
                      className={`font-display text-xl leading-snug transition-colors sm:text-2xl ${
                        isOpen ? "text-gold-300" : "text-sand group-hover:text-gold-300"
                      }`}
                    >
                      {item.q}
                    </span>
                    {/* plus that rotates into a cross */}
                    <span
                      aria-hidden="true"
                      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-[transform,border-color,background-color] duration-500 ease-out-expo ${
                        isOpen ? "rotate-45 border-gold-400 bg-gold-400 text-navy-950" : "border-white/20 text-sand"
                      }`}
                    >
                      <span className="absolute h-px w-3.5 bg-current" />
                      <span className="absolute h-3.5 w-px bg-current" />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 pr-12 text-[15px] leading-relaxed text-mist sm:text-base">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
