"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useSite } from "@/components/providers/Providers";
import { usePrefersReducedMotion } from "@/hooks/useMedia";
import { formatPrice } from "@/data/destinations";
import { getTrip, placeOf, tripImage, type Trip } from "@/data/trips";

const EASE = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Rendered once on the page; any section opens it through `openJourney(id)`. */
export function JourneyModal() {
  const { journeyId, closeJourney } = useSite();
  const trip = journeyId ? getTrip(journeyId) : undefined;
  return <AnimatePresence>{trip && <Dialog key={trip.id} trip={trip} onClose={closeJourney} />}</AnimatePresence>;
}

function Dialog({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const { planTrip } = useSite();
  const reduced = usePrefersReducedMotion();
  const place = placeOf(trip);
  const photo = tripImage(trip);
  const dialog = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timeline = useRef<HTMLOListElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // The itinerary line draws itself as you scroll inside the dialog.
  const { scrollYProgress } = useScroll({ container: panel, target: timeline, offset: ["start 85%", "end 60%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  // Focus the dialog, and hand focus back to whatever opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });
    return () => opener?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !dialog.current) return;
    const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const plan = () => {
    onClose();
    planTrip(place.slug, trip.title);
  };

  const titleId = `journey-${trip.id}-title`;

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative w-full max-w-5xl overflow-hidden rounded-t-3xl bg-navy-900 shadow-2xl ring-1 ring-white/10 sm:rounded-3xl"
      >
        <div
          ref={panel}
          data-lenis-prevent
          className="relative max-h-[92svh] overflow-y-auto overscroll-contain md:grid md:grid-cols-[0.9fr_1.1fr]"
        >
          {/* photo: sticky beside the scrolling content on desktop */}
          <div className="relative aspect-[16/10] md:sticky md:top-0 md:aspect-auto md:h-[92svh]">
            <div className="absolute inset-0">
              <Image
                src={photo.image}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 460px, 100vw"
                placeholder="blur"
                className="object-cover"
                style={{ objectPosition: photo.focus }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/15 to-transparent md:from-ink/85 md:via-transparent" />
            <div className="absolute bottom-5 left-6 md:bottom-8 md:left-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold-300">{place.country}</p>
              <p className="font-display text-3xl font-light text-sand md:text-4xl">{place.name}</p>
            </div>
          </div>

          <div className="p-6 sm:p-9">
            <ul className="flex flex-wrap gap-2" aria-label="Travel style">
              {trip.styles.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-gold-400/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold-300"
                >
                  {s}
                </li>
              ))}
              <li className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-mist">
                {trip.nights} nights
              </li>
            </ul>
            <h2 id={titleId} className="mt-5 font-display text-4xl font-light leading-tight text-sand sm:text-5xl">
              {trip.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-mist">{trip.summary}</p>

            <h3 className="mt-10 text-[11px] uppercase tracking-[0.28em] text-mist/70">Day by day</h3>
            <ol ref={timeline} className="relative mt-5 space-y-7 pl-8">
              {/* track + the line that draws itself */}
              <span aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10" />
              <motion.span
                aria-hidden="true"
                className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-gold-400"
                style={{ scaleY: reduced ? 1 : draw }}
              />
              {trip.itinerary.map((stop) => (
                <motion.li
                  key={stop.day}
                  className="relative"
                  initial={reduced ? false : { opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ root: panel, once: true, margin: "0px 0px -12% 0px" }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-8 top-1.5 h-[15px] w-[15px] rounded-full border border-gold-400 bg-navy-900"
                  >
                    <span className="absolute inset-[4px] rounded-full bg-gold-400" />
                  </span>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gold-400">{stop.day}</p>
                  <p className="mt-1 font-display text-xl text-sand">{stop.title}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-mist">{stop.text}</p>
                </motion.li>
              ))}
            </ol>

            <div className="mt-12 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.28em] text-mist/70">Included</h3>
                <ul className="mt-4 space-y-2.5">
                  {trip.included.map((item) => (
                    <li key={item} className="flex gap-3 text-[14px] text-sand">
                      <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-gold-400">
                        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.28em] text-mist/70">Not included</h3>
                <ul className="mt-4 space-y-2.5">
                  {trip.notIncluded.map((item) => (
                    <li key={item} className="flex gap-3 text-[14px] text-mist">
                      <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-mist/80">
                        <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-5 rounded-2xl bg-navy-950/60 p-6 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12px] text-mist">From, per person</p>
                <p className="font-display text-3xl text-sand">
                  {formatPrice(trip.price)} <span className="text-base text-mist">/ {trip.nights} nights</span>
                </p>
              </div>
              <button
                type="button"
                onClick={plan}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300"
              >
                Plan this trip
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                >
                  <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label={`Close ${trip.title}`}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-navy-950/75 text-sand ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-navy-950"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
}
