"use client";

import { useEffect, useRef } from "react";
import { animate, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useMedia";

const EASE = [0.16, 1, 0.3, 1] as const;

const STATS = [
  { value: 12, decimals: 0, unit: "years", label: "designing journeys, one traveler at a time" },
  { value: 40, decimals: 0, unit: "countries", label: "walked, slept in and vetted by our team" },
  { value: 4.9, decimals: 1, unit: "average rating", label: "from guests after they came home" },
];

const PILLARS = [
  {
    title: "One planner, start to finish",
    text: "The person who designs your trip is the person who answers at 2am if a flight is cancelled.",
  },
  {
    title: "Nothing off the shelf",
    text: "Every itinerary is a starting point. We rebuild it around your pace, your interests and your dates.",
  },
  {
    title: "Places we know by heart",
    text: "We only sell destinations our team has travelled personally — usually more than once.",
  },
];

export function WhyMeridian() {
  return (
    <section id="why" aria-labelledby="why-title" className="relative overflow-hidden bg-sand py-24 text-navy-950 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-700 sm:text-xs">
              <span className="h-px w-8 bg-gold-600/70" aria-hidden="true" />
              Why Meridian
            </p>
            <h2
              id="why-title"
              className="font-display text-[clamp(2.4rem,5.6vw,5rem)] font-light leading-[1] tracking-[-0.02em]"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Travel with someone <em className="italic text-gold-700">who&rsquo;s been.</em>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-navy-800/80 sm:text-base lg:justify-self-end">
            We&rsquo;re a small studio of travel designers. No call centres, no package tours — just carefully made
            journeys and a person you can actually reach.
          </p>
        </div>

        <dl className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-navy-950/10 sm:mt-20 md:grid-cols-3">
          {STATS.map((s, i) => (
            <div key={s.unit} className="flex flex-col gap-3 bg-sand p-8 sm:p-10">
              <dt className="order-2 text-[15px] leading-relaxed text-navy-800/75">
                <span className="block text-[11px] uppercase tracking-[0.28em] text-gold-700">{s.unit}</span>
                {s.label}
              </dt>
              <dd className="order-1 font-display text-[clamp(4rem,8vw,7rem)] font-light leading-none tracking-[-0.03em]">
                <CountUp to={s.value} decimals={s.decimals} delay={i * 0.12} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[12px] text-navy-800/80">Sample figures for this demo project.</p>

        <ul className="mt-16 grid gap-10 sm:mt-20 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.li
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
              className="border-t border-navy-950/15 pt-6"
            >
              <p className="font-display text-sm text-gold-700">0{i + 1}</p>
              <h3 className="mt-3 font-display text-2xl">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-navy-800/75">{p.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Server-renders the final value, then counts up from zero as the stat scrolls into view.
 * It never rests at zero: with no IntersectionObserver, reduced motion, or a hidden tab
 * the final value simply stays, and a timer guarantees the end value even if animation
 * frames are throttled.
 */
function CountUp({ to, decimals, delay }: { to: number; decimals: number; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || typeof IntersectionObserver === "undefined") return;
    const format = (n: number) => n.toFixed(decimals);
    let controls: ReturnType<typeof animate> | undefined;
    let safety: number | undefined;

    const finish = () => {
      controls?.stop();
      el.textContent = format(to);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (document.visibilityState !== "visible") return;
        // Only now (just before it's on screen) does it drop to zero and count.
        el.textContent = format(0);
        controls = animate(0, to, {
          duration: 2,
          delay,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (v) => (el.textContent = format(v)),
          onComplete: finish,
        });
        safety = window.setTimeout(finish, (delay + 2) * 1000 + 300);
      },
      // fire slightly before the stat enters the viewport
      { rootMargin: "0px 0px 10% 0px" },
    );
    io.observe(el);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") finish();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
      document.removeEventListener("visibilitychange", onVisibility);
      finish();
    };
  }, [to, decimals, delay, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {to.toFixed(decimals)}
    </span>
  );
}
