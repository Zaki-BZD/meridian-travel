"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/components/providers/Providers";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMedia";
import { DESTINATIONS, formatPrice, type Destination } from "@/data/destinations";
import { STORY_IMAGES } from "@/data/story";
import { flagshipTrip } from "@/data/trips";
import { JOURNEY_EVENT } from "@/lib/events";

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

export function Destinations() {
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  // Pinned horizontal scroll on tablet/desktop; stacked cards on phones and for reduced motion.
  const horizontal = wide && !reduced;

  const { scrollTo, openJourney } = useSite();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pinST = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!horizontal || !section.current || !track.current) return;
    const trackEl = track.current;
    const ctx = gsap.context(() => {
      const distance = () => trackEl.scrollWidth - window.innerWidth;

      const tween = gsap.to(trackEl, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          pin: true,
          scrub: 0.8,
          start: "top top",
          end: () => `+=${distance()}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      pinST.current = tween.scrollTrigger ?? null;

      gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
        const img = card.querySelector("[data-layer=image]");
        const name = card.querySelector("[data-layer=name]");
        const meta = card.querySelector("[data-layer=meta]");
        const anim = { containerAnimation: tween, trigger: card, scrub: true } as const;

        // parallax: the photo travels slower than the card
        gsap.fromTo(img, { xPercent: -12 }, { xPercent: 12, ease: "none", scrollTrigger: { ...anim, start: "left right", end: "right left" } });
        // the huge name slides in as the card arrives
        gsap.fromTo(name, { xPercent: 28, opacity: 0.2 }, { xPercent: 0, opacity: 1, ease: "power2.out", scrollTrigger: { ...anim, start: "left 95%", end: "left 25%" } });
        gsap.fromTo(meta, { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: "power2.out", scrollTrigger: { ...anim, start: "left 70%", end: "left 20%" } });
      });
    }, section);

    // This pin is created after hydration, so re-order and re-measure everything below it.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      pinST.current = null;
      ctx.revert();
    };
  }, [horizontal]);

  // Globe pins / hero list jump to a destination card.
  useEffect(() => {
    const onJourney = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      const index = DESTINATIONS.findIndex((d) => d.slug === slug);
      if (index < 0) return;
      const st = pinST.current;
      if (st) {
        scrollTo(st.start + (index / (DESTINATIONS.length - 1)) * (st.end - st.start));
      } else {
        scrollTo(`#journey-${slug}`);
      }
    };
    window.addEventListener(JOURNEY_EVENT, onJourney);
    return () => window.removeEventListener(JOURNEY_EVENT, onJourney);
  }, [scrollTo]);

  const view = (d: Destination) => openJourney(flagshipTrip(d.slug).id);

  return (
    <section
      ref={section}
      id="destinations"
      aria-labelledby="destinations-title"
      className={`relative bg-ink ${horizontal ? "h-svh overflow-hidden" : "py-24 sm:py-32"}`}
    >
      <h2 id="destinations-title" className="sr-only">
        Six journeys from London
      </h2>

      {!horizontal && (
        <div className="mx-auto mb-12 max-w-[1440px] px-5 sm:px-10">
          <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400">
            <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
            Six journeys
          </p>
          <p aria-hidden="true" className="font-display text-[clamp(2.5rem,9vw,4rem)] font-light leading-[1] text-sand">
            One departure, <em className="italic text-gold-300">six worlds.</em>
          </p>
        </div>
      )}

      <div
        ref={track}
        className={horizontal ? "flex h-full w-max will-change-transform" : "mx-auto flex max-w-[1440px] flex-col gap-6 px-5 sm:px-10"}
      >
        {DESTINATIONS.map((d, i) => {
          const story = STORY_IMAGES[d.slug];
          return (
            <article
              key={d.slug}
              id={`journey-${d.slug}`}
              data-card
              aria-labelledby={`journey-${d.slug}-name`}
              className={
                horizontal
                  ? "relative h-full w-screen shrink-0 overflow-hidden"
                  : "relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[16/11]"
              }
            >
              {/* layer 1: photo (wider than the card so it can drift) */}
              <div data-layer="image" className={`absolute inset-y-0 ${horizontal ? "-inset-x-[14%]" : "inset-x-0"}`}>
                <Image
                  src={story.image}
                  alt={story.alt}
                  fill
                  sizes={horizontal ? "130vw" : "(min-width: 640px) 90vw, 100vw"}
                  placeholder="blur"
                  className="object-cover"
                  style={{ objectPosition: story.focus }}
                />
              </div>
              {/* layer 2: grade */}
              <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t from-ink to-ink/30 ${horizontal ? "via-ink/25" : "via-ink/55"}`} />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

              {/* layer 3: type */}
              <div className={`relative flex h-full flex-col justify-end ${horizontal ? "px-10 pb-16 lg:px-20 lg:pb-20" : "p-6 sm:p-10"}`}>
                <p className={`mb-auto font-display text-sm text-sand/80 ${horizontal ? "pt-36" : ""}`}>
                  {pad(i + 1)} <span className="text-sand/40">/ {pad(DESTINATIONS.length)}</span>
                </p>

                <h3
                  id={`journey-${d.slug}-name`}
                  data-layer="name"
                  className={`font-display font-light leading-[0.85] tracking-[-0.03em] text-sand ${
                    horizontal ? "text-[clamp(5rem,15vw,15rem)]" : "text-[clamp(3rem,13vw,6rem)]"
                  }`}
                  style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
                >
                  {d.name}
                </h3>

                <motion.div
                  data-layer="meta"
                  className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
                  initial={horizontal || reduced ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gold-400">{d.country}</p>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-sand/85 sm:text-base">{d.tagline}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 md:justify-end">
                    <p className="text-sm text-mist">
                      from <span className="font-display text-xl text-sand">{formatPrice(d.priceFrom)}</span> / {d.nights} nights
                    </p>
                    <button
                      type="button"
                      onClick={() => view(d)}
                      className="group inline-flex items-center gap-3 rounded-full bg-sand/95 px-6 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300"
                    >
                      View journey
                      <span className="sr-only">: {d.name}</span>
                      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1">
                        <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              </div>
            </article>
          );
        })}
      </div>

      {horizontal && (
        <p aria-hidden="true" className="pointer-events-none absolute left-10 top-24 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 lg:left-20">
          <span className="h-px w-8 bg-gold-400/70" />
          Six journeys · keep scrolling
        </p>
      )}
    </section>
  );
}
