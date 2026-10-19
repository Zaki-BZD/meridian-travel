"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionConfig } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useMedia";

gsap.registerPlugin(ScrollTrigger);

/** A request to pre-fill the inquiry form, e.g. from a journey's "Plan this trip". */
export type PlanRequest = { destination: string; trip?: string; nonce: number };

type SiteContextValue = {
  /** True once the intro loader has finished (or was skipped). */
  introDone: boolean;
  finishIntro: () => void;
  /** Smooth-scrolls to a selector, element or absolute Y, falling back to native scrolling. */
  scrollTo: (target: string | HTMLElement | number, opts?: { offset?: number; immediate?: boolean }) => void;
  /** Pause page scrolling (e.g. while a modal is open). */
  setScrollLocked: (locked: boolean) => void;
  /** The journey shown in the global journey modal, if any. */
  journeyId: string | null;
  openJourney: (id: string) => void;
  closeJourney: () => void;
  /** Pre-fills the inquiry form and scrolls to it. */
  plan: PlanRequest | null;
  planTrip: (destination: string, trip?: string) => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [introDone, setIntroDone] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanRequest | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Reduced motion: there is no loader, so the intro is done immediately.
  const effectiveIntroDone = introDone || reduced;

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Freeze scrolling while the loader (via setScrollLocked) or the journey modal is on screen.
  // The journey lock follows the open state, so closing frees scrolling at once (not after the exit animation).
  const frozen = scrollLocked || journeyId !== null;
  useEffect(() => {
    if (frozen) {
      lenisRef.current?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenisRef.current?.start();
      document.documentElement.style.removeProperty("overflow");
    }
  }, [frozen]);

  const finishIntro = useCallback(() => setIntroDone(true), []);

  const scrollTo = useCallback<SiteContextValue["scrollTo"]>(
    (target, opts = {}) => {
      const offset = opts.offset ?? 0;
      let top: number;
      if (typeof target === "number") {
        top = target + offset;
      } else {
        const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
        if (!el) return;
        top = el.getBoundingClientRect().top + window.scrollY + offset;
      }
      const lenis = lenisRef.current;
      if (lenis && !reduced) {
        lenis.scrollTo(top, { immediate: opts.immediate, duration: 1.6 });
      } else {
        window.scrollTo({ top, behavior: "auto" });
      }
    },
    [reduced],
  );

  const openJourney = useCallback((id: string) => setJourneyId(id), []);
  const closeJourney = useCallback(() => setJourneyId(null), []);

  const planTrip = useCallback(
    (destination: string, trip?: string) => {
      setPlan({ destination, trip, nonce: Date.now() });
      // let any closing modal release the scroll lock first
      requestAnimationFrame(() => requestAnimationFrame(() => scrollTo("#inquire")));
    },
    [scrollTo],
  );

  const value = useMemo(
    () => ({
      introDone: effectiveIntroDone,
      finishIntro,
      scrollTo,
      setScrollLocked,
      journeyId,
      openJourney,
      closeJourney,
      plan,
      planTrip,
    }),
    [effectiveIntroDone, finishIntro, scrollTo, journeyId, openJourney, closeJourney, plan, planTrip],
  );

  return (
    <SiteContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SiteContext.Provider>
  );
}
