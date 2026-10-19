"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSite } from "@/components/providers/Providers";

const EASE = [0.16, 1, 0.3, 1] as const;

// In page order.
const LINKS = [
  { href: "#destinations", label: "Destinations" },
  { href: "#places", label: "Places" },
  { href: "#trip-finder", label: "Trip finder" },
  { href: "#why", label: "Why Meridian" },
  { href: "#stories", label: "Stories" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const { introDone, scrollTo, setScrollLocked } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!document.querySelector(href)) return;
    e.preventDefault();
    if (menuOpen) {
      closeMenu(false);
      // wait for the scroll lock to lift before scrolling
      requestAnimationFrame(() => requestAnimationFrame(() => scrollTo(href)));
    } else {
      scrollTo(href);
    }
  };

  const openMenu = () => {
    setMenuOpen(true);
    setScrollLocked(true);
  };
  const closeMenu = (restoreFocus = true) => {
    setMenuOpen(false);
    setScrollLocked(false);
    if (restoreFocus) menuBtn.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={introDone ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled && !menuOpen ? "border-b border-white/5 bg-navy-950/70 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:h-20 sm:px-10">
          <a href="#top" onClick={(e) => go(e, "#top")} className="group relative z-10 flex items-baseline gap-2">
            <span className="font-display text-lg tracking-[0.42em] text-sand sm:text-xl">MERIDIAN</span>
            <span className="sr-only">— home</span>
          </a>
          <ul className="hidden items-center gap-6 text-[13px] tracking-wide text-mist lg:flex xl:gap-9">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => go(e, l.href)} className="transition-colors hover:text-sand">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="relative z-10 flex items-center gap-2">
            <a
              href="#inquire"
              onClick={(e) => go(e, "#inquire")}
              className="rounded-full border border-gold-400/50 px-4 py-2 text-[13px] text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-navy-950 sm:px-5"
            >
              Plan my trip
            </a>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-sand lg:hidden"
            >
              <span aria-hidden="true" className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 top-0 h-px w-4 bg-current transition-transform duration-300 ${menuOpen ? "translate-y-[5.5px] rotate-45" : ""}`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-px w-4 bg-current transition-transform duration-300 ${menuOpen ? "-translate-y-[5.5px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && <MobileMenu onClose={() => closeMenu()} onNavigate={go} />}
      </AnimatePresence>
    </>
  );
}

function MobileMenu({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return onClose();
    if (e.key !== "Tab" || !panel.current) return;
    // keep focus inside the menu (the toggle button in the header stays reachable via Shift+Tab from the top)
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>("a, button"));
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <motion.div
      id="mobile-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      onKeyDown={onKeyDown}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      className="grain fixed inset-0 z-40 flex flex-col bg-navy-950 px-5 pb-10 pt-28 sm:px-10 lg:hidden"
    >
      <ul className="flex flex-col gap-1">
        {LINKS.map((l, i) => (
          <li key={l.href} className="overflow-hidden">
            <motion.a
              href={l.href}
              onClick={(e) => onNavigate(e, l.href)}
              initial={{ y: "100%" }}
              animate={{ y: "0%", transition: { delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE } }}
              className="block py-1.5 font-display text-[clamp(2rem,9vw,3.2rem)] font-light leading-tight text-sand"
            >
              {l.label}
            </motion.a>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-2 text-sm text-mist">
        <span>hello@meridian-travel.example</span>
        <span>+44 20 7946 0123</span>
        <button type="button" onClick={onClose} className="mt-4 w-fit text-gold-300 underline underline-offset-4">
          Close menu
        </button>
      </div>
    </motion.div>
  );
}
