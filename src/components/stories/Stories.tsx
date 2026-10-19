"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSite } from "@/components/providers/Providers";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMedia";
import { getTrip, placeOf, tripImage } from "@/data/trips";

const STORIES = [
  {
    trip: "kyoto-slow",
    headline: "We stopped checking the time somewhere around day three.",
    traveler: "Margot & Ilse Verhoeven",
  },
  {
    trip: "patagonia-torres",
    headline: "The wind up there rearranges your priorities.",
    traveler: "Devan Ruiz-Okoro",
  },
  {
    trip: "amalfi-long-lunches",
    headline: "Four generations, one very long table in Ravello.",
    traveler: "The Lindqvist-Amari family",
  },
];

// Stacked like postcards; fanned out on hover / focus. Index 1 sits on top.
const STACK = [
  { x: "-6%", y: 18, rotate: -6, zIndex: 1 },
  { x: "0%", y: 0, rotate: 1.5, zIndex: 3 },
  { x: "6%", y: 22, rotate: 7, zIndex: 2 },
];
const FAN = [
  { x: "-108%", y: 34, rotate: -8, zIndex: 1 },
  { x: "0%", y: -10, rotate: 0, zIndex: 3 },
  { x: "108%", y: 34, rotate: 8, zIndex: 2 },
];

export function Stories() {
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const interactive = wide && !reduced;
  const [fanned, setFanned] = useState(false);

  return (
    <section id="stories" aria-labelledby="stories-title" className="relative overflow-hidden bg-navy-950 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 sm:text-xs">
            <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
            Field notes
            <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
          </p>
          <h2
            id="stories-title"
            className="font-display text-[clamp(2.4rem,5.6vw,4.8rem)] font-light leading-[1] tracking-[-0.02em] text-sand"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Postcards from <em className="italic text-gold-300">the road.</em>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-mist">
            {interactive ? "Hover the stack to spread them out." : "Three journeys, in our travelers' words."}{" "}
            <span className="text-mist/80">Names are fictional.</span>
          </p>
        </div>

        <ul
          onMouseEnter={() => setFanned(true)}
          onMouseLeave={() => setFanned(false)}
          onFocus={() => setFanned(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setFanned(false);
          }}
          className={
            interactive
              ? "relative mx-auto mt-16 h-[560px] w-[340px]"
              : "mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {STORIES.map((s, i) => (
            <motion.li
              key={s.trip}
              className={interactive ? "absolute inset-x-0 top-0" : ""}
              initial={false}
              animate={interactive ? (fanned ? FAN[i] : STACK[i]) : undefined}
              transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.9 }}
            >
              <StoryCard {...s} />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StoryCard({ trip: tripId, headline, traveler }: (typeof STORIES)[number]) {
  const { openJourney } = useSite();
  const trip = getTrip(tripId)!;
  const place = placeOf(trip);
  const photo = tripImage(trip);
  return (
    <article className="overflow-hidden rounded-2xl bg-sand p-3 text-navy-950 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        <Image
          src={photo.image}
          alt=""
          fill
          sizes="340px"
          placeholder="blur"
          className="object-cover"
          style={{ objectPosition: photo.focus }}
        />
      </div>
      <div className="px-3 pb-3 pt-5">
        <p className="text-[11px] uppercase tracking-[0.26em] text-gold-700">
          {place.name} · {trip.nights} nights
        </p>
        <blockquote className="mt-3 font-display text-[1.45rem] leading-snug">&ldquo;{headline}&rdquo;</blockquote>
        <p className="mt-4 text-[13px] text-navy-800/70">— {traveler}</p>
        <button
          type="button"
          onClick={() => openJourney(trip.id)}
          className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-navy-900 underline decoration-gold-500 underline-offset-4 hover:decoration-2"
        >
          See their itinerary<span className="sr-only">: {trip.title}</span>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3">
            <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>
    </article>
  );
}
