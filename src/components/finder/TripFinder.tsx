"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useSite } from "@/components/providers/Providers";
import { formatPrice } from "@/data/destinations";
import { PRICE_MAX, PRICE_MIN, TRAVEL_STYLES, TRIPS, placeOf, tripImage, type TravelStyle, type Trip } from "@/data/trips";

const EASE = [0.16, 1, 0.3, 1] as const;

const LENGTHS = [
  { id: "any", label: "Any length", test: () => true },
  { id: "short", label: "Up to 7 nights", test: (t: Trip) => t.nights <= 7 },
  { id: "mid", label: "8–10 nights", test: (t: Trip) => t.nights >= 8 && t.nights <= 10 },
  { id: "long", label: "11+ nights", test: (t: Trip) => t.nights >= 11 },
] as const;
type LengthId = (typeof LENGTHS)[number]["id"];

export function TripFinder() {
  const { openJourney } = useSite();
  const [budget, setBudget] = useState(PRICE_MAX);
  const [length, setLength] = useState<LengthId>("any");
  const [styles, setStyles] = useState<TravelStyle[]>([]);
  const ids = { budget: useId(), length: useId(), styles: useId(), status: useId() };

  const results = useMemo(() => {
    const lengthTest = LENGTHS.find((l) => l.id === length)!.test;
    return TRIPS.filter(
      (t) => t.price <= budget && lengthTest(t) && (styles.length === 0 || t.styles.some((s) => styles.includes(s))),
    ).sort((a, b) => a.price - b.price);
  }, [budget, length, styles]);

  const toggleStyle = (s: TravelStyle) =>
    setStyles((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const reset = () => {
    setBudget(PRICE_MAX);
    setLength("any");
    setStyles([]);
  };
  const filtered = budget !== PRICE_MAX || length !== "any" || styles.length > 0;
  const fill = ((budget - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <section id="trip-finder" aria-labelledby="finder-title" className="relative bg-navy-950 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-10 lg:grid-cols-[340px_1fr] lg:gap-16 xl:grid-cols-[380px_1fr]">
        {/* ---------- filters ---------- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 sm:text-xs">
            <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
            Trip finder
          </p>
          <h2
            id="finder-title"
            className="font-display text-[clamp(2.4rem,5vw,4rem)] font-light leading-[1] tracking-[-0.02em] text-sand"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Find your <em className="italic text-gold-300">journey.</em>
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-mist">
            Twelve itineraries, each a starting point. Narrow them down, then we&rsquo;ll tailor the one you love.
          </p>

          <div className="mt-10 space-y-9 rounded-2xl border border-white/10 bg-navy-900/60 p-6 sm:p-7">
            {/* budget */}
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={ids.budget} className="text-[11px] uppercase tracking-[0.26em] text-mist">
                  Budget per person
                </label>
                <span className="font-display text-xl text-sand" aria-hidden="true">
                  up to {formatPrice(budget)}
                </span>
              </div>
              <input
                id={ids.budget}
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={250}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                aria-valuetext={`Up to ${formatPrice(budget)}`}
                className="range mt-4 w-full"
                style={{ "--fill": `${fill}%` } as React.CSSProperties}
              />
              <div className="mt-2 flex justify-between text-[11px] text-mist/70" aria-hidden="true">
                <span>{formatPrice(PRICE_MIN)}</span>
                <span>{formatPrice(PRICE_MAX)}</span>
              </div>
            </div>

            {/* trip length: native radios, styled as pills */}
            <fieldset>
              <legend id={ids.length} className="text-[11px] uppercase tracking-[0.26em] text-mist">
                Trip length
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {LENGTHS.map((l) => (
                  <label key={l.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="trip-length"
                      value={l.id}
                      checked={length === l.id}
                      onChange={() => setLength(l.id)}
                      className="peer sr-only"
                    />
                    <span className="inline-block rounded-full border border-white/15 px-3.5 py-2 text-[13px] text-mist transition-colors peer-checked:border-gold-400 peer-checked:bg-gold-400 peer-checked:text-navy-950 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-400 hover:text-sand">
                      {l.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* travel style: toggle buttons */}
            <div role="group" aria-labelledby={ids.styles}>
              <p id={ids.styles} className="text-[11px] uppercase tracking-[0.26em] text-mist">
                Travel style
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {TRAVEL_STYLES.map((s) => {
                  const on = styles.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleStyle(s)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-colors ${
                        on ? "border-gold-400 bg-gold-400/15 text-gold-300" : "border-white/15 text-mist hover:text-sand"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${on ? "bg-gold-400" : "bg-white/25"}`}
                      />
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <p id={ids.status} role="status" aria-live="polite" className="text-sm text-mist">
                <span className="font-display text-lg text-sand">{results.length}</span> of {TRIPS.length} journeys
              </p>
              <button
                type="button"
                onClick={reset}
                disabled={!filtered}
                className="text-sm text-gold-300 underline decoration-gold-400/40 underline-offset-4 transition-opacity hover:decoration-gold-400 disabled:opacity-30 disabled:no-underline"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>

        {/* ---------- results ---------- */}
        <div>
          <LayoutGroup>
            <motion.ul layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-describedby={ids.status}>
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((trip) => (
                  <ResultCard key={trip.id} trip={trip} onOpen={() => openJourney(trip.id)} />
                ))}
              </AnimatePresence>
            </motion.ul>
          </LayoutGroup>

          <AnimatePresence>
            {results.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-white/15 p-10"
              >
                <p className="font-display text-2xl text-sand">Nothing matches — yet.</p>
                <p className="max-w-md text-[15px] text-mist">
                  Try a higher budget or fewer styles. Or tell us what you have in mind and we&rsquo;ll design it from
                  scratch.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-gold-400/60 px-5 py-2.5 text-sm text-gold-300 hover:bg-gold-400 hover:text-navy-950"
                >
                  Reset filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ trip, onOpen }: { trip: Trip; onOpen: () => void }) {
  const place = placeOf(trip);
  const photo = tripImage(trip);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
      transition={{ duration: 0.55, ease: EASE }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-navy-900 ring-1 ring-white/10 transition-shadow hover:ring-gold-400/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={photo.image}
          alt=""
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 90vw"
          placeholder="blur"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          style={{ objectPosition: photo.focus }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-navy-950/75 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-sand backdrop-blur">
          {place.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-snug text-sand">{trip.title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-mist">{trip.summary}</p>
        <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-gold-400/90">{trip.styles.join(" · ")}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <p className="whitespace-nowrap text-[13px] text-mist">
            <span className="font-display text-xl text-sand">{formatPrice(trip.price)}</span> / {trip.nights} nights
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 whitespace-nowrap rounded-full border border-gold-400/50 px-4 py-2 text-[13px] text-gold-300 transition-colors hover:bg-gold-400 hover:text-navy-950"
          >
            View journey<span className="sr-only">: {trip.title}</span>
          </button>
        </div>
      </div>
    </motion.li>
  );
}
