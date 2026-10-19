import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="grain relative isolate flex min-h-svh flex-col overflow-hidden bg-navy-950 px-5 sm:px-10">
      {/* the loader's flight path, faint, flying off the page */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M -40 760 C 320 700, 520 300, 820 330 S 1240 180, 1480 120"
          fill="none"
          stroke="rgba(233,194,124,0.22)"
          strokeWidth="1"
          strokeDasharray="2 8"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="1240" cy="196" r="10" fill="rgba(233,194,124,0.15)" />
        <circle cx="1240" cy="196" r="3.5" fill="#f3d9a4" />
      </svg>

      <header className="mx-auto flex h-16 w-full max-w-[1440px] items-center sm:h-20">
        <Link href="/" className="font-display text-lg tracking-[0.42em] text-sand sm:text-xl">
          MERIDIAN
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center pb-24">
        <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 sm:text-xs">
          <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
          Error 404
        </p>
        <h1
          className="max-w-[12ch] font-display text-[clamp(3rem,9vw,8rem)] font-light leading-[0.95] tracking-[-0.02em] text-sand"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          Off the <em className="font-normal italic text-gold-300">map.</em>
        </h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-mist sm:text-base">
          The page you&rsquo;re looking for has wandered off our itinerary. Let&rsquo;s get you back to somewhere
          worth the journey.
        </p>
        <Link
          href="/"
          className="group mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300"
        >
          Back to journeys
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1">
            <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
