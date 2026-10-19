"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers/Providers";
import { usePrefersReducedMotion } from "@/hooks/useMedia";
import { INTRO_TOTAL_MS, WIPE_START_MS, loaderElapsedMs } from "@/lib/intro";

const FLIGHT_PATH = "M -40 760 C 320 700, 520 300, 820 330 S 1240 180, 1480 120";

/**
 * Intro (≤1.5s): a thin flight path draws across the screen, then the loader
 * wipes away with a clip-path to reveal the page.
 *
 * The animation itself is CSS + SMIL, so it starts at first paint and never waits
 * for JavaScript; JS only reports when it's done. Hidden entirely for reduced motion.
 */
export function Loader() {
  const { finishIntro, setScrollLocked } = useSite();
  const reduced = usePrefersReducedMotion();
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    // Catch up with the CSS timeline (hydration may happen mid-intro, or after it).
    const elapsed = loaderElapsedMs(root.current) ?? INTRO_TOTAL_MS;
    const toWipe = Math.max(0, WIPE_START_MS - elapsed);
    if (toWipe > 0) setScrollLocked(true);
    const reveal = window.setTimeout(() => {
      finishIntro();
      setScrollLocked(false);
    }, toWipe);
    const unmount = window.setTimeout(() => setGone(true), Math.max(0, INTRO_TOTAL_MS - elapsed) + 50);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(unmount);
      setScrollLocked(false);
    };
  }, [finishIntro, setScrollLocked, reduced]);

  if (gone || reduced) return null;

  return (
    <div ref={root} data-intro-loader aria-hidden="true" className="loader grain fixed inset-0 z-[100] bg-navy-950">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <path
          d={FLIGHT_PATH}
          fill="none"
          stroke="rgba(233,194,124,0.18)"
          strokeWidth="1"
          strokeDasharray="2 8"
          vectorEffect="non-scaling-stroke"
        />
        <path className="loader-path" d={FLIGHT_PATH} pathLength={1} fill="none" stroke="#e9c27c" strokeWidth="1.25" />
        <g>
          <circle r="10" fill="rgba(233,194,124,0.18)" />
          <circle r="3.5" fill="#f3d9a4" />
          <animateMotion
            path={FLIGHT_PATH}
            dur="0.9s"
            fill="freeze"
            rotate="auto"
            calcMode="spline"
            keyPoints="0;1"
            keyTimes="0;1"
            keySplines="0.45 0 0.55 1"
          />
        </g>
      </svg>

      <div className="loader-word absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl tracking-[0.5em] text-sand sm:text-4xl">MERIDIAN</span>
        <span className="mt-3 font-display text-sm italic text-gold-400">Journeys, curated.</span>
      </div>
    </div>
  );
}
