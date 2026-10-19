"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/components/providers/Providers";
import { usePrefersReducedMotion } from "@/hooks/useMedia";
import { PLACES } from "@/data/places";
import { flagshipTrip } from "@/data/trips";
import { isValidEmail } from "@/lib/inquiry";

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.16, 1, 0.3, 1] as const;
const BRAND = "MERIDIAN".split("");

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    path: "M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/",
    path: "M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3l.1.4-.3 1.2c0 .2-.2.3-.4.2-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2.1-1.3 2.8A10 10 0 1 0 12 2z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3V9.75zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.9c0-1.17-.02-2.68-1.63-2.68-1.64 0-1.89 1.28-1.89 2.6V21h-4V9.75z",
  },
];

export function Footer() {
  const { scrollTo, openJourney } = useSite();
  const reduced = usePrefersReducedMotion();
  const brand = useRef<HTMLDivElement>(null);

  // The brand line rises letter by letter as you reach the bottom of the page.
  useEffect(() => {
    const el = brand.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-letter]",
        { yPercent: 105 },
        {
          yPercent: 0,
          ease: "none",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const anchor = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!document.querySelector(href)) return;
    e.preventDefault();
    scrollTo(href);
  };

  const heading = "text-[11px] uppercase tracking-[0.3em] text-gold-400";
  const link = "text-[15px] text-mist transition-colors hover:text-sand";

  return (
    <footer id="contact" className="relative overflow-hidden bg-ink pt-24 sm:pt-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-[1fr_0.8fr_0.8fr_1.5fr] lg:gap-10">
          <nav aria-labelledby="footer-destinations" className="col-span-2 sm:col-span-1">
            <h2 id="footer-destinations" className={heading}>
              Destinations
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
              {PLACES.map((p) => (
                <li key={p.slug}>
                  <button type="button" onClick={() => openJourney(flagshipTrip(p.slug).id)} className={link}>
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className={heading}>
              Company
            </h2>
            <ul className="mt-6 space-y-3">
              <li>
                <a href="#why" onClick={anchor("#why")} className={link}>
                  About
                </a>
              </li>
              <li>
                <a href="mailto:careers@meridian-travel.example" className={link}>
                  Careers
                </a>
              </li>
              <li>
                <a href="mailto:press@meridian-travel.example" className={link}>
                  Press
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-support">
            <h2 id="footer-support" className={heading}>
              Support
            </h2>
            <ul className="mt-6 space-y-3">
              <li>
                <a href="#faq" onClick={anchor("#faq")} className={link}>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#inquire" onClick={anchor("#inquire")} className={link}>
                  Contact
                </a>
              </li>
              <li>
                <Link href="/terms" className={link}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={link}>
                  Privacy
                </Link>
              </li>
            </ul>
          </nav>

          <Newsletter className="col-span-2 sm:col-span-1" />
        </div>

        <div className="mt-16 flex flex-col gap-8 border-t border-white/10 pt-10 md:flex-row md:items-center md:justify-between">
          <address className="flex flex-col gap-2 text-[15px] not-italic text-mist sm:flex-row sm:gap-8">
            <span>
              <span className="sr-only">Email: </span>hello@meridian-travel.example
            </span>
            <span>
              <span className="sr-only">Phone: </span>+44 20 7946 0123
            </span>
          </address>
          <ul className="flex gap-3" aria-label="Social media">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Meridian on ${s.label} (opens in a new tab)`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-mist transition-colors hover:border-gold-400 hover:text-gold-300"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]">
                    <path fill="currentColor" d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* full-width brand line */}
      <div ref={brand} aria-hidden="true" className="mt-16 select-none overflow-hidden px-2 sm:mt-20">
        <p
          className="flex justify-between font-display text-[19.5vw] font-light leading-[0.8] tracking-[-0.03em] text-sand/95"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30, "wght" 220' }}
        >
          {BRAND.map((ch, i) => (
            <span key={i} className="block overflow-hidden pb-[0.04em]">
              <span data-letter className="block">
                {ch}
              </span>
            </span>
          ))}
        </p>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col-reverse items-start gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="text-[13px] text-mist/80">© 2026 Meridian. Demo project.</p>
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="group inline-flex items-center gap-3 text-[13px] text-sand"
        >
          Back to top
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:border-gold-400 group-hover:text-gold-300">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5">
              <path d="M8 14V2M3 7l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
        </button>
      </div>
    </footer>
  );
}

function Newsletter({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const id = useId();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Enter your email to subscribe.");
    if (!isValidEmail(email)) return setError("That email doesn't look right — try name@example.com.");
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("idle");
      setError("We couldn't sign you up just now. Please try again.");
    }
  };

  return (
    <div className={className}>
      <h2 id={`${id}-title`} className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
        Newsletter
      </h2>
      <p className="mt-6 font-display text-2xl leading-snug text-sand">Postcards, once a month.</p>
      <p className="mt-2 text-[15px] text-mist">New journeys, quiet seasons and the odd secret hotel. No spam, ever.</p>

      <div className="relative mt-6 min-h-[118px]">
        <AnimatePresence mode="wait" initial={false}>
          {status === "done" ? (
            <motion.div
              key="done"
              role="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex items-center gap-4 rounded-2xl border border-gold-400/30 bg-gold-400/10 p-5"
            >
              <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
                <motion.circle cx="20" cy="20" r="18" fill="none" stroke="var(--color-gold-400)" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                <motion.path d="M12 20.5l5 5 11-12" fill="none" stroke="var(--color-gold-300)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.45 }} />
              </svg>
              <p className="text-[15px] text-sand">
                You&rsquo;re on the list. <span className="text-mist">The first postcard lands next month.</span>
              </p>
            </motion.div>
          ) : (
            <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0, y: -8 }} aria-labelledby={`${id}-title`}>
              <label htmlFor={`${id}-email`} className="sr-only">
                Email address
              </label>
              <div className="flex gap-2">
                <input
                  id={`${id}-email`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={`min-w-0 flex-1 rounded-full border bg-navy-900/70 px-5 py-3 text-[15px] text-sand placeholder:text-mist/70 focus:outline-none focus:ring-2 ${
                    error ? "border-red-300/60 focus:ring-red-300/40" : "border-white/15 focus:border-gold-400 focus:ring-gold-400/30"
                  }`}
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="shrink-0 rounded-full bg-gold-400 px-5 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300 disabled:opacity-70"
                >
                  {status === "sending" ? "…" : "Subscribe"}
                </button>
              </div>
              <p id={`${id}-error`} role="alert" className="mt-2 min-h-5 text-[13px] text-red-300">
                {error}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
