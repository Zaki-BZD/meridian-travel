import Link from "next/link";

/** Minimal shell for the demo legal pages. */
export function LegalPage({ title, sections }: { title: string; sections: { heading: string; body: string }[] }) {
  return (
    <main className="mx-auto min-h-svh max-w-2xl px-5 py-20 sm:px-10 sm:py-28">
      <Link href="/" className="font-display text-lg tracking-[0.42em] text-sand">
        MERIDIAN
      </Link>
      <h1 className="mt-14 font-display text-5xl font-light text-sand">{title}</h1>
      <p className="mt-4 rounded-xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-gold-300">
        Meridian is a fictional company created for a portfolio demo. This page is placeholder text, not a real legal
        document.
      </p>
      {sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="font-display text-2xl text-sand">{s.heading}</h2>
          <p className="mt-3 leading-relaxed text-mist">{s.body}</p>
        </section>
      ))}
      <Link
        href="/"
        className="mt-14 inline-flex rounded-full border border-gold-400/60 px-6 py-3 text-sm text-gold-300 hover:bg-gold-400 hover:text-navy-950"
      >
        Back to Meridian
      </Link>
    </main>
  );
}
