"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useMedia";

const EASE = [0.16, 1, 0.3, 1] as const;

// Fictional travelers; avatars are initials, never photos of real people.
const REVIEWS = [
  {
    name: "Elodie Marchetti",
    trip: "Kyoto in Slow Motion",
    rating: 5,
    quote:
      "The pre-opening garden visit alone was worth it. Every day felt unhurried, and every detail had been thought about before we thought of it.",
  },
  {
    name: "Tomasz Brennan-Ito",
    trip: "Torres del Paine Expedition",
    rating: 5,
    quote:
      "Our guide read the weather like a book and moved our Towers hike by a day. We had the summit in sunshine while everyone else got sleet.",
  },
  {
    name: "Priya & Sol Halvorsen",
    trip: "Marrakech & the Agafay Desert",
    rating: 5,
    quote:
      "The riad, the souk walk, the night in the desert — it felt like a friend who lives there was showing us around. We'd book again tomorrow.",
  },
  {
    name: "Agnes Whitlock-Duarte",
    trip: "Iceland under the Aurora",
    rating: 5,
    quote:
      "We saw the northern lights from bed on our second night. The ice cave with a glaciologist is the most extraordinary place I've ever stood.",
  },
  {
    name: "Rafael Nakamura-Reyes",
    trip: "Bali: Jungle to Reef",
    rating: 4,
    quote:
      "Ten days, two villas, zero stress. One transfer ran late and our planner had sorted a new car before we'd even noticed.",
  },
  {
    name: "Corinne Abiodun",
    trip: "Amalfi Coast, Long Lunches",
    rating: 5,
    quote:
      "The gozzo day to Capri was pure joy. I came home three kilos heavier and genuinely rested for the first time in years.",
  },
];

type Review = (typeof REVIEWS)[number];

const initials = (name: string) =>
  name
    .replace(/&.*$/, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export function Testimonials() {
  const reduced = usePrefersReducedMotion();
  // second row starts mid-way through the list so the rows don't mirror each other
  const rowB = [...REVIEWS.slice(3), ...REVIEWS.slice(0, 3)];

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="relative overflow-hidden bg-ink py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 sm:text-xs">
              <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
              Reviews
            </p>
            <motion.h2
              id="reviews-title"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1, ease: EASE }}
              className="font-display text-[clamp(2.4rem,5.6vw,5rem)] font-light leading-[1] tracking-[-0.02em] text-sand"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Travelers who came back <em className="italic text-gold-300">changed.</em>
            </motion.h2>
          </div>
          <div className="flex items-center gap-4 lg:justify-self-end">
            <Stars rating={5} size="lg" />
            <p className="text-sm text-mist">
              <span className="font-display text-2xl text-sand">4.9</span> average from 1,200+ guests
              <span className="block text-[12px] text-mist/80">Sample figures · reviewers are fictional</span>
            </p>
          </div>
        </div>
      </div>

      {reduced ? (
        <ul className="mx-auto mt-14 grid max-w-[1440px] gap-5 px-5 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <li key={r.name}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="marquee mt-14 space-y-5 sm:mt-16">
          <MarqueeRow reviews={REVIEWS} direction="left" label="Traveler reviews" />
          <MarqueeRow reviews={rowB} direction="right" label="More traveler reviews" />
        </div>
      )}
    </section>
  );
}

function MarqueeRow({ reviews, direction, label }: { reviews: Review[]; direction: "left" | "right"; label: string }) {
  return (
    <div className="marquee-row relative overflow-hidden">
      {/* soft fade at both edges */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-ink to-transparent sm:w-32" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-ink to-transparent sm:w-32" />
      <div className={`marquee-track flex w-max gap-5 ${direction === "right" ? "marquee-reverse" : ""}`}>
        {/* the list is rendered twice for a seamless loop; the copy is hidden from assistive tech */}
        {[0, 1].map((copy) => (
          <ul key={copy} aria-label={copy === 0 ? label : undefined} aria-hidden={copy === 1 || undefined} className="flex gap-5">
            {reviews.map((r) => (
              <li key={r.name} className="w-[300px] shrink-0 sm:w-[380px]">
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review: r }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-white/10 bg-navy-900/70 p-6 sm:p-7">
      <Stars rating={r.rating} />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-sand/90">&ldquo;{r.quote}&rdquo;</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 font-display text-[15px] text-navy-950"
        >
          {initials(r.name)}
        </span>
        <span>
          <span className="block text-sm text-sand">{r.name}</span>
          <span className="block text-[12px] text-mist">{r.trip}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const px = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} aria-hidden="true" viewBox="0 0 20 20" className={`${px} ${n <= rating ? "text-gold-400" : "text-white/15"}`}>
          <path
            fill="currentColor"
            d="M10 1.5l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z"
          />
        </svg>
      ))}
    </span>
  );
}
