"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSite } from "@/components/providers/Providers";
import {
  DESTINATION_OPTIONS,
  EMPTY_INQUIRY,
  MESSAGE_MAX,
  isoDate,
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
  type InquiryInput,
} from "@/lib/inquiry";

const EASE = [0.16, 1, 0.3, 1] as const;
const FIELD_ORDER: InquiryField[] = ["name", "email", "destination", "departure", "returnDate", "travelers", "message"];

const noopSubscribe = () => () => {};
/** Today's date on the client only — never read the clock while prerendering. */
const useToday = () => useSyncExternalStore(noopSubscribe, () => isoDate(new Date()), () => undefined);

type Status = "idle" | "sending" | "success" | "error";

export function InquiryForm() {
  const { plan } = useSite();
  const today = useToday();
  const [values, setValues] = useState<InquiryInput>(EMPTY_INQUIRY);
  const [touched, setTouched] = useState<Partial<Record<InquiryField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [appliedPlan, setAppliedPlan] = useState<number | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const uid = useId();

  // "Plan this trip" elsewhere on the page pre-fills the form (adjusting state during render, not in an effect).
  if (plan && plan.nonce !== appliedPlan) {
    setAppliedPlan(plan.nonce);
    setStatus("idle");
    setValues((v) => ({
      ...v,
      destination: plan.destination,
      message: v.message || (plan.trip ? `I'd love to plan “${plan.trip}”. ` : ""),
    }));
  }

  const clientErrors = validateInquiry(values, today);
  const errors: InquiryErrors = { ...clientErrors, ...serverErrors };
  const visible = (f: InquiryField) => (submitted || touched[f] ? errors[f] : undefined);
  const visibleCount = FIELD_ORDER.filter((f) => visible(f)).length;

  const set = (f: keyof InquiryInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [f]: value }));
    if (f in serverErrors)
      setServerErrors((cur) => {
        const next = { ...cur };
        delete next[f as InquiryField];
        return next;
      });
  };
  const blur = (f: InquiryField) => () => setTouched((t) => ({ ...t, [f]: true }));
  const bump = (d: 1 | -1) =>
    setValues((v) => ({ ...v, travelers: String(Math.min(12, Math.max(1, (Number(v.travelers) || 0) + d))) }));

  const focusFirstError = (errs: InquiryErrors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) (form.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstError(clientErrors);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: InquiryErrors };
      if (res.ok && data.ok) {
        setStatus("success");
        return;
      }
      if (res.status === 422 && data.errors) {
        setServerErrors(data.errors);
        setStatus("idle");
        focusFirstError(data.errors);
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setValues(EMPTY_INQUIRY);
    setTouched({});
    setSubmitted(false);
    setServerErrors({});
    setStatus("idle");
  };

  const firstName = values.name.trim().split(/\s+/)[0];
  const describedBy = (f: InquiryField, hint?: boolean) =>
    [hint ? `${uid}-${f}-hint` : "", visible(f) ? `${uid}-${f}-error` : ""].filter(Boolean).join(" ") || undefined;
  const fieldProps = (f: InquiryField) => ({
    id: `${uid}-${f}`,
    name: f,
    value: values[f],
    onChange: set(f),
    onBlur: blur(f),
    "aria-invalid": visible(f) ? true : undefined,
    "aria-describedby": describedBy(f),
  });

  return (
    <section id="inquire" aria-labelledby="inquire-title" className="relative overflow-hidden bg-navy-900 py-24 sm:py-32 lg:py-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 60% at 85% 10%, rgba(217,166,86,0.12) 0%, rgba(11,26,51,0) 70%)" }}
      />
      <div className="relative mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-10 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        {/* ---------- copy ---------- */}
        <div>
          <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-400 sm:text-xs">
            <span className="h-px w-8 bg-gold-400/70" aria-hidden="true" />
            Plan my trip
          </p>
          <h2
            id="inquire-title"
            className="font-display text-[clamp(2.4rem,5.6vw,5rem)] font-light leading-[1] tracking-[-0.02em] text-sand"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Tell us where. <em className="italic text-gold-300">We&rsquo;ll handle the rest.</em>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-mist sm:text-base">
            Share a few details and a travel designer will reply within one working day with ideas, honest advice and a
            first itinerary. No obligation, no hard sell.
          </p>
          <ol className="mt-10 space-y-6">
            {[
              ["Share a few details", "Two minutes, right here."],
              ["Talk to your designer", "A call or email — whichever you prefer."],
              ["Receive your itinerary", "Usually within three working days."],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-400/50 font-display text-sm text-gold-300">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-display text-lg text-sand">{title}</span>
                  <span className="block text-sm text-mist">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- form / success ---------- */}
        <div className="relative rounded-3xl border border-white/10 bg-navy-950/70 p-6 shadow-2xl backdrop-blur sm:p-10">
          <AnimatePresence mode="wait" initial={false}>
            {status === "success" ? (
              <Success key="success" name={firstName} onReset={reset} />
            ) : (
              <motion.form
                key="form"
                ref={form}
                noValidate
                onSubmit={onSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, ease: EASE }}
                aria-describedby={`${uid}-required`}
              >
                <p id={`${uid}-required`} className="mb-6 text-[13px] text-mist">
                  All fields are required unless marked optional.
                </p>

                <div ref={summary} role="alert" aria-live="assertive">
                  {submitted && visibleCount > 0 && (
                    <p className="mb-6 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                      Please check {visibleCount === 1 ? "1 field" : `${visibleCount} fields`} below.
                    </p>
                  )}
                </div>

                <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                  <Field label="Full name" htmlFor={`${uid}-name`} error={visible("name")} errorId={`${uid}-name-error`}>
                    <input {...fieldProps("name")} type="text" autoComplete="name" className={inputCls(visible("name"))} />
                  </Field>

                  <Field label="Email" htmlFor={`${uid}-email`} error={visible("email")} errorId={`${uid}-email-error`}>
                    <input
                      {...fieldProps("email")}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      className={inputCls(visible("email"))}
                    />
                  </Field>

                  <Field
                    label="Destination"
                    htmlFor={`${uid}-destination`}
                    error={visible("destination")}
                    errorId={`${uid}-destination-error`}
                    className="sm:col-span-2"
                  >
                    <div className="relative">
                      <select {...fieldProps("destination")} className={`${inputCls(visible("destination"))} appearance-none pr-10`}>
                        <option value="" disabled>
                          Choose a destination
                        </option>
                        {DESTINATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist">
                        <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </Field>

                  <Field label="Departure" htmlFor={`${uid}-departure`} error={visible("departure")} errorId={`${uid}-departure-error`}>
                    <input {...fieldProps("departure")} type="date" min={today} className={`${inputCls(visible("departure"))} [color-scheme:dark]`} />
                  </Field>

                  <Field label="Return" htmlFor={`${uid}-returnDate`} error={visible("returnDate")} errorId={`${uid}-returnDate-error`}>
                    <input
                      {...fieldProps("returnDate")}
                      type="date"
                      min={values.departure || today}
                      className={`${inputCls(visible("returnDate"))} [color-scheme:dark]`}
                    />
                  </Field>

                  <Field label="Travelers" htmlFor={`${uid}-travelers`} error={visible("travelers")} errorId={`${uid}-travelers-error`}>
                    <div className="flex items-stretch gap-2">
                      <button
                        type="button"
                        onClick={() => bump(-1)}
                        aria-label="One fewer traveler"
                        className="w-12 shrink-0 rounded-xl border border-white/15 text-lg text-sand transition-colors hover:border-gold-400"
                      >
                        −
                      </button>
                      <input
                        {...fieldProps("travelers")}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={12}
                        className={`${inputCls(visible("travelers"))} text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
                      />
                      <button
                        type="button"
                        onClick={() => bump(1)}
                        aria-label="One more traveler"
                        className="w-12 shrink-0 rounded-xl border border-white/15 text-lg text-sand transition-colors hover:border-gold-400"
                      >
                        +
                      </button>
                    </div>
                  </Field>

                  <Field
                    label="Message"
                    optional
                    htmlFor={`${uid}-message`}
                    error={visible("message")}
                    errorId={`${uid}-message-error`}
                    className="sm:col-span-2"
                    hint={
                      <span id={`${uid}-message-hint`} className={values.message.length > MESSAGE_MAX ? "text-red-300" : ""}>
                        {values.message.length.toLocaleString("en-US")} / {MESSAGE_MAX.toLocaleString("en-US")}
                      </span>
                    }
                  >
                    <textarea
                      {...fieldProps("message")}
                      aria-describedby={describedBy("message", true)}
                      rows={4}
                      placeholder="Celebrations, must-sees, how you like to travel…"
                      className={`${inputCls(visible("message"))} resize-y`}
                    />
                  </Field>

                  {/* honeypot — hidden from people and assistive tech */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Company
                      <input
                        type="text"
                        name="company"
                        tabIndex={-1}
                        autoComplete="off"
                        value={values.company}
                        onChange={set("company")}
                      />
                    </label>
                  </div>
                </div>

                {status === "error" && (
                  <p role="alert" className="mt-6 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    Something went wrong sending your inquiry. Please try again, or email us at hello@meridian-travel.example.
                  </p>
                )}

                <div className="mt-8 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] text-mist/70">Demo form — submissions are logged, not emailed.</p>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-gold-400 px-8 py-4 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                  >
                    {status === "sending" ? (
                      <>
                        <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send my inquiry
                        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1">
                          <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

const inputCls = (error?: string) =>
  `w-full rounded-xl border bg-navy-900/80 px-4 py-3 text-[15px] text-sand placeholder:text-mist/70 transition-colors focus:outline-none focus-visible:outline-none focus:ring-2 ${
    error ? "border-red-300/60 focus:ring-red-300/40" : "border-white/15 hover:border-white/25 focus:border-gold-400 focus:ring-gold-400/30"
  }`;

function Field({
  label,
  htmlFor,
  error,
  errorId,
  optional,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  optional?: boolean;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] text-sand">
          {label} {optional && <span className="text-mist/70">(optional)</span>}
        </label>
        {hint && <span className="text-[12px] text-mist/70">{hint}</span>}
      </div>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden text-[13px] text-red-300"
          >
            <span className="block pt-2">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Success({ name, onReset }: { name: string; onReset: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      onAnimationStart={() => heading.current?.focus({ preventScroll: true })}
      className="flex min-h-[520px] flex-col items-center justify-center text-center"
    >
      <svg viewBox="0 0 96 96" className="h-24 w-24" aria-hidden="true">
        <motion.circle
          cx="48"
          cy="48"
          r="44"
          fill="none"
          stroke="var(--color-gold-400)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
        <motion.path
          d="M30 49l12 12 24-26"
          fill="none"
          stroke="var(--color-gold-300)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
        />
      </svg>
      <h3 ref={heading} tabIndex={-1} className="mt-8 font-display text-3xl text-sand outline-none sm:text-4xl">
        Thank you{name ? `, ${name}` : ""}.
      </h3>
      <p role="status" className="mt-4 max-w-sm text-[15px] leading-relaxed text-mist">
        Your inquiry is with our travel designers. Expect a personal reply within one working day.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-10 rounded-full border border-gold-400/60 px-6 py-3 text-sm text-gold-300 transition-colors hover:bg-gold-400 hover:text-navy-950"
      >
        Send another inquiry
      </button>
    </motion.div>
  );
}
