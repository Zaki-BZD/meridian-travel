"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/useMedia";
import { formatPrice } from "@/data/destinations";
import { PLACES, type Place } from "@/data/places";
import { flagshipTrip } from "@/data/trips";
import { useSite } from "@/components/providers/Providers";

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.16, 1, 0.3, 1] as const;
const rise: Variants = {
  hidden: { y: "105%" },
  shown: (i: number) => ({ y: "0%", transition: { duration: 1.1, delay: i * 0.08, ease: EASE } }),
};
const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: EASE } }),
};

const pad = (n: number) => String(n).padStart(2, "0");

export function Places() {
  const reduced = usePrefersReducedMotion();
  const { openJourney } = useSite();
  // Each place opens its entry-level journey in the shared journey modal.
  const open = (p: Place) => openJourney(flagshipTrip(p.slug).id);
  // Reduced motion: render in the final state, no entrance animation.
  const initial = reduced ? false : "hidden";

  return (
    <section id="places" aria-labelledby="places-title" className="relative bg-navy-950 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <header className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <motion.p
              variants={fade}
              custom={0}
              initial={initial}
              whileInView="shown"
              viewport={{ once: true, margin: "-10% 0px" }}
              className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 sm:text-xs"
            >
              <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
              Eight places, chosen slowly
            </motion.p>
            <h2
              id="places-title"
              className="font-display text-[clamp(2.5rem,6.2vw,5.6rem)] font-light leading-[0.98] tracking-[-0.02em] text-sand"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              {["Places worth", "the journey."].map((t, i) => (
                <span key={t} className="block overflow-hidden pb-[0.08em]">
                  <motion.span
                    variants={rise}
                    custom={i}
                    initial={initial}
                    whileInView="shown"
                    viewport={{ once: true, margin: "-10% 0px" }}
                    className="block"
                  >
                    {i === 1 ? (
                      <>
                        the <em className="font-normal italic text-gold-300">journey.</em>
                      </>
                    ) : (
                      t
                    )}
                  </motion.span>
                </span>
              ))}
            </h2>
          </div>
          <motion.p
            variants={fade}
            custom={0.25}
            initial={initial}
            whileInView="shown"
            viewport={{ once: true, margin: "-10% 0px" }}
            className="max-w-md text-[15px] leading-relaxed text-mist sm:text-base lg:justify-self-end"
          >
            Every place on this list has been walked, slept in and argued over by our planners. Hover to look closer —
            open one to see how we&rsquo;d spend your days there.
          </motion.p>
        </header>

        <Panels reduced={reduced} onOpen={open} />
      </div>

      <Carousel reduced={reduced} onOpen={open} />

    </section>
  );
}

/* ---------- Desktop: expanding panels ---------- */

function Panels({ reduced, onOpen }: { reduced: boolean; onOpen: (p: Place) => void }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (reduced || !el) return;
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
      const images = gsap.utils.toArray<HTMLElement>("[data-panel-img]");

      // Rise one after another with a clip-path reveal.
      gsap.fromTo(
        panels,
        { yPercent: 14, clipPath: "inset(100% 0% 0% 0%)" },
        {
          yPercent: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.25,
          ease: "expo.out",
          stagger: 0.085,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        },
      );

      // Slow parallax zoom while the section passes through the viewport.
      gsap.fromTo(
        images,
        { scale: 1.28, yPercent: -4 },
        {
          scale: 1.06,
          yPercent: 4,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <ul
      ref={list}
      aria-label="Destinations"
      className="mt-16 hidden h-[min(78vh,760px)] min-h-[540px] gap-2 lg:flex xl:gap-3"
    >
      {PLACES.map((p, i) => {
        const isActive = active === i;
        return (
          <li
            key={p.slug}
            data-panel
            onMouseEnter={() => setActive(i)}
            onFocusCapture={() => setActive(i)}
            onClick={() => onOpen(p)}
            style={{ flexGrow: isActive ? 6.5 : 1 }}
            className="group relative min-w-0 basis-0 cursor-pointer overflow-hidden rounded-2xl bg-navy-900 transition-[flex-grow] duration-[900ms] ease-out-expo"
          >
            <div data-panel-img className="absolute inset-0 will-change-transform">
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes="(min-width: 1024px) 55vw, 1px"
                placeholder="blur"
                className="object-cover"
                style={{ objectPosition: p.focus }}
              />
            </div>

            {/* the others darken slightly */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-ink transition-opacity duration-700 ${isActive ? "opacity-0" : "opacity-55 group-hover:opacity-35"}`}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"
            />

            <span className="absolute left-5 top-5 font-display text-sm text-sand/90 [text-shadow:0_1px_10px_rgba(5,13,26,0.7)]">{pad(i + 1)}</span>

            {/* collapsed: vertical name */}
            <span
              aria-hidden="true"
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap font-display text-2xl text-sand transition-opacity duration-500 [writing-mode:vertical-rl] ${
                isActive ? "opacity-0" : "opacity-100 delay-300"
              }`}
            >
              {p.name}
            </span>

            {/* expanded: details (fixed width so text never reflows mid-animation) */}
            <div
              className={`absolute bottom-0 left-0 w-[min(30rem,40vw)] p-8 transition-[opacity,transform] xl:p-10 ${
                isActive
                  ? "translate-y-0 opacity-100 delay-300 duration-700"
                  : "pointer-events-none translate-y-6 opacity-0 duration-300"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold-400">{p.country}</p>
              <h3
                className="mt-2 font-display text-[clamp(2.6rem,4.2vw,4.4rem)] font-light leading-none text-sand"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                {p.name}
              </h3>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-sand/85">{p.line}</p>
              <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-mist">
                <div className="flex gap-1.5">
                  <dt>Best time:</dt>
                  <dd className="text-sand">{p.bestTime}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="sr-only">Price</dt>
                  <dd>
                    from <span className="text-sand">{formatPrice(p.priceFrom)}</span> / {p.nights} nights
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                aria-label={`Explore ${p.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(p);
                }}
                className="group/btn mt-7 inline-flex items-center gap-3 rounded-full border border-gold-400/60 px-6 py-2.5 text-sm text-gold-300 transition-colors hover:bg-gold-400 hover:text-navy-950"
              >
                Explore
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1">
                  <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Mobile / tablet: snap carousel ---------- */

function Carousel({ reduced, onOpen }: { reduced: boolean; onOpen: (p: Place) => void }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const step = card.offsetWidth + 16;
    setIndex(Math.min(PLACES.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  };

  const go = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <motion.div
      className="mt-12 lg:hidden"
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, ease: EASE }}
    >
      <ul
        ref={track}
        onScroll={onScroll}
        aria-label="Destinations"
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 sm:scroll-px-10 sm:px-10"
      >
        {PLACES.map((p, i) => (
          <li key={p.slug} className="w-[80vw] max-w-[360px] shrink-0 snap-start">
            <article className="flex h-full flex-col">
              <button
                type="button"
                onClick={() => onOpen(p)}
                aria-label={`Explore ${p.name}`}
                className="relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-navy-900 text-left"
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 1023px) 80vw, 1px"
                  placeholder="blur"
                  className="object-cover"
                  style={{ objectPosition: p.focus }}
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <span className="absolute left-4 top-4 font-display text-sm text-sand/90 [text-shadow:0_1px_10px_rgba(5,13,26,0.7)]">{pad(i + 1)}</span>
                <span className="absolute inset-x-0 bottom-0 p-5">
                  <span className="block text-[10px] uppercase tracking-[0.3em] text-gold-400">{p.country}</span>
                  <span className="mt-1 block font-display text-4xl font-light text-sand">{p.name}</span>
                </span>
              </button>
              <p className="mt-4 text-[15px] leading-relaxed text-sand/85">{p.line}</p>
              <p className="mt-2 text-[13px] text-mist">
                Best time: <span className="text-sand">{p.bestTime}</span>
                <span aria-hidden="true" className="mx-2 text-mist/40">·</span>
                from <span className="text-sand">{formatPrice(p.priceFrom)}</span> / {p.nights} nights
              </p>
              <button
                type="button"
                onClick={() => onOpen(p)}
                aria-label={`Explore ${p.name}`}
                className="mt-4 inline-flex w-fit items-center gap-3 rounded-full border border-gold-400/60 px-5 py-2.5 text-sm text-gold-300"
              >
                Explore
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5">
                  <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </article>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-8 flex max-w-[1440px] items-center gap-5 px-5 sm:px-10">
        <span className="font-display text-sm text-sand" aria-live="polite">
          {pad(index + 1)} <span className="text-mist/80">/ {pad(PLACES.length)}</span>
        </span>
        <span className="relative h-px flex-1 bg-white/10" aria-hidden="true">
          <span
            className="absolute inset-y-0 left-0 bg-gold-400 transition-[width] duration-500"
            style={{ width: `${((index + 1) / PLACES.length) * 100}%` }}
          />
        </span>
        <div className="flex gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => go(dir)}
              disabled={dir === -1 ? index === 0 : index === PLACES.length - 1}
              aria-label={dir === -1 ? "Previous place" : "Next place"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-sand transition-colors hover:border-gold-400 disabled:opacity-30"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-4 w-4 ${dir === -1 ? "rotate-180" : ""}`}>
                <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
