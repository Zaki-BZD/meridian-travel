/**
 * The intro loader runs on CSS/SMIL from first paint, independent of hydration
 * (see `.loader` in globals.css). These helpers let JS catch up with it.
 */

/** When the clip-path wipe starts (the page begins to show). Keep in sync with globals.css. */
export const WIPE_START_MS = 950;
/** When the wipe has finished. */
export const INTRO_TOTAL_MS = 1450;

export const LOADER_SELECTOR = "[data-intro-loader]";

/** Milliseconds since the loader's animations began, or null if that can't be determined. */
export function loaderElapsedMs(el: Element | null): number | null {
  if (!el || typeof el.getAnimations !== "function") return null;
  const wipe = el.getAnimations().find((a) => (a as CSSAnimation).animationName === "loader-wipe");
  const t = wipe?.currentTime;
  return typeof t === "number" ? t : null;
}

let revealDecision: boolean | undefined;

/**
 * Decided once, at hydration: should the hero play its entrance animation?
 * Only if the loader is still covering the page — on slow devices that hydrate after
 * the intro has already cleared, the server-rendered hero simply stays put.
 */
export function heroShouldReveal() {
  if (revealDecision === undefined) {
    const elapsed = loaderElapsedMs(document.querySelector(LOADER_SELECTOR));
    revealDecision =
      elapsed !== null &&
      elapsed < WIPE_START_MS - 100 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return revealDecision;
}
