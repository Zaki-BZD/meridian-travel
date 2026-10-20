"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import { useSite } from "@/components/providers/Providers";
import { useCoarsePointer, useIntroReveal, useIsMobile, usePrefersReducedMotion } from "@/hooks/useMedia";
import { DESTINATIONS, HOME } from "@/data/destinations";
import { goToJourney } from "@/lib/events";
import { GlobeBoundary, GlobeStill, hasWebGL } from "./globe/GlobeFallback";

const Globe = dynamic(() => import("./globe/Globe"), { ssr: false });

/** No WebGL at all: show the still straight away. */
function StillReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return <GlobeStill />;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const line: Variants = {
  // instant: it only ever happens under the intro loader
  hidden: { y: "105%", transition: { duration: 0 } },
  shown: (i: number) => ({ y: "0%", transition: { duration: 1.1, delay: 0.15 + i * 0.09, ease: EASE } }),
};
const fade: Variants = {
  hidden: { opacity: 0, y: 14, transition: { duration: 0 } },
  shown: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
};
// Movement only, never transparent: this paragraph is the mobile LCP element, so it must
// be painted the moment the loader wipes away.
const drift: Variants = {
  hidden: { y: 18, transition: { duration: 0 } },
  shown: (d: number) => ({ y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
};

export function Hero() {
  const { introDone, scrollTo } = useSite();
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const coarse = useCoarsePointer();
  const section = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);
  const [loadGlobe, setLoadGlobe] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Fetch and boot three.js only after the intro, when the main thread is idle —
  // keeps it out of the way of first paint and hydration. (It fades in after the intro anyway.)
  useEffect(() => {
    if (!introDone) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    let idleId: number | undefined;
    // Phones have no intro to hide behind, so give first paint and hydration a head start.
    const delay = window.setTimeout(
      () => (idleId = idle(() => setLoadGlobe(true), { timeout: 1200 })),
      mobile ? 1800 : 0,
    );
    return () => {
      window.clearTimeout(delay);
      if (idleId !== undefined) cancel(idleId);
    };
  }, [introDone, mobile]);

  // Stop rendering WebGL once the hero scrolls away.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The destinations story owns the scroll maths (its cards live in a pinned horizontal track).
  const goToDestination = useCallback((slug: string) => goToJourney(slug), []);
  const onReady = useCallback(() => setGlobeReady(true), []);

  // Server-render the copy in its final position so it paints (and counts for LCP) under the loader;
  // once hydrated it snaps to hidden, still covered, and reveals when the intro finishes.
  const reveal = useIntroReveal();
  const state = !reveal || introDone ? "shown" : "hidden";

  return (
    <section
      ref={section}
      id="top"
      aria-labelledby="hero-title"
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy-950"
    >
      {/* backdrop: horizon glow behind the globe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 72% 48%, rgba(27,53,96,0.55) 0%, rgba(7,18,38,0) 70%), radial-gradient(40% 30% at 15% 100%, rgba(217,166,86,0.10) 0%, rgba(7,18,38,0) 70%)",
        }}
      />

      {/* globe */}
      <div
        className={`absolute inset-x-0 top-[4rem] h-[46svh] transition-opacity duration-[1600ms] ease-out md:inset-y-0 md:left-[34%] md:right-[-6%] md:top-0 md:h-auto ${
          globeReady && introDone ? "opacity-100" : "opacity-0"
        }`}
      >
        {loadGlobe &&
          (hasWebGL() ? (
            <GlobeBoundary fallback={<GlobeStill />} onError={onReady}>
              <Globe
                active={introDone}
                inView={inView}
                reduced={reduced}
                mobile={mobile}
                coarse={coarse}
                highlighted={highlighted}
                onHighlight={setHighlighted}
                onSelect={goToDestination}
                onReady={onReady}
              />
            </GlobeBoundary>
          ) : (
            <StillReady onReady={onReady} />
          ))}
      </div>

      {/* copy */}
      <div className="pointer-events-none relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pb-10 pt-[48svh] sm:px-10 md:justify-center md:pb-24 md:pt-28">
        <motion.p
          variants={fade}
          custom={0.1}
          initial="shown"
          animate={state}
          className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 sm:text-xs"
        >
          <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
          Private journeys from {HOME.name}
        </motion.p>

        <h1
          id="hero-title"
          className="max-w-[11ch] font-display text-[clamp(2.9rem,8.4vw,7.6rem)] font-light leading-[0.95] tracking-[-0.02em] text-sand"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          {["The world,", "without the", "noise."].map((t, i) => (
            <span key={t} className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={line} custom={i} initial="shown" animate={state} className="block">
                {i === 2 ? <em className="font-normal italic text-gold-300">{t}</em> : t}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          variants={drift}
          custom={0.3}
          initial="shown"
          animate={state}
          className="mt-6 max-w-md text-[15px] leading-relaxed text-mist sm:text-base"
        >
          Slow, beautifully planned travel to six places we know by heart. One planner, one itinerary, nothing left to
          chance.
        </motion.p>

        <motion.div
          variants={fade}
          custom={0.7}
          initial="shown"
          animate={state}
          className="pointer-events-auto mt-9 flex flex-wrap items-center gap-4"
        >
          <a
            href="#inquire"
            onClick={(e) => {
              if (!document.querySelector("#inquire")) return;
              e.preventDefault();
              scrollTo("#inquire");
            }}
            className="group inline-flex items-center gap-3 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300"
          >
            Plan my trip
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
          <a
            href="#destinations"
            onClick={(e) => {
              if (!document.querySelector("#destinations")) return;
              e.preventDefault();
              scrollTo("#destinations");
            }}
            className="rounded-full px-3 py-3.5 text-sm text-sand underline decoration-gold-400/40 underline-offset-[6px] transition-colors hover:decoration-gold-400"
          >
            Explore journeys
          </a>
        </motion.div>

        {/* Accessible twin of the globe pins: same targets, keyboard & screen-reader friendly. */}
        <motion.nav
          aria-label="Destinations on the globe"
          variants={fade}
          custom={0.95}
          initial="shown"
          animate={state}
          className="pointer-events-auto mt-12 md:mt-16"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-mist/70">Six routes, one departure</p>
          <ul className="flex max-w-xl flex-wrap gap-x-1 gap-y-1">
            {DESTINATIONS.map((d) => (
              <li key={d.slug}>
                <a
                  href={`#journey-${d.slug}`}
                  onClick={(e) => {
                    if (!document.querySelector(`#journey-${d.slug}`)) return;
                    e.preventDefault();
                    goToDestination(d.slug);
                  }}
                  onMouseEnter={() => setHighlighted(d.slug)}
                  onMouseLeave={() => setHighlighted(null)}
                  onFocus={() => setHighlighted(d.slug)}
                  onBlur={() => setHighlighted(null)}
                  className={`inline-block rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    highlighted === d.slug
                      ? "border-gold-400/70 bg-gold-400/10 text-gold-300"
                      : "border-white/10 text-mist hover:text-sand"
                  }`}
                >
                  {d.name}
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>
      </div>

      {/* scroll cue */}
      <motion.div
        aria-hidden="true"
        variants={fade}
        custom={1.2}
        initial="shown"
        animate={state}
        className="pointer-events-none absolute bottom-8 right-10 hidden items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-mist/70 md:flex"
      >
        Scroll
        <span className="relative block h-10 w-px overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-gold-400" />
        </span>
      </motion.div>
    </section>
  );
}
