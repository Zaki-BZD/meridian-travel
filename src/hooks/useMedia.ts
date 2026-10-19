"use client";

import { useSyncExternalStore } from "react";
import { heroShouldReveal } from "@/lib/intro";

function subscribeQuery(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
}

/** SSR-safe media query hook. Returns `serverFallback` during prerender. */
export function useMediaQuery(query: string, serverFallback = false) {
  return useSyncExternalStore(
    subscribeQuery(query),
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** Phones and small tablets: vertical layouts, lighter WebGL. */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");

export const useCoarsePointer = () => useMediaQuery("(pointer: coarse)");

const noopSubscribe = () => () => {};

/** True if the hero should play its entrance (the loader was still up at hydration). */
export const useIntroReveal = () => useSyncExternalStore(noopSubscribe, heroShouldReveal, () => false);
