import { ArrowUpRight, Download, MapPin } from "lucide-react";
import { glance, profile } from "@/content";
import { keepTogether } from "@/lib/text";

export function Hero() {
  return (
    <section id="top" className="mx-auto max-w-5xl px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
      <div className="reveal inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-xs text-muted">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
        {profile.availability}
      </div>

      <h1 className="reveal reveal-delay-1 mt-8 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-6xl">
        {profile.name}
        <span className="mt-2 block text-3xl leading-[1.12] tracking-[-0.03em] text-muted sm:text-[2.75rem]">
          {profile.role} at {profile.company}
        </span>
      </h1>

      <p className="reveal reveal-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
        {keepTogether(profile.headline)}
      </p>

      <div className="reveal reveal-delay-3 mt-10 grid grid-cols-2 items-center gap-3 sm:flex sm:flex-wrap">
        <a
          href={`mailto:${profile.email}`}
          className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Get in touch
        </a>
        <a
          href={profile.resume}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/30"
        >
          <Download className="h-3.5 w-3.5" /> Résumé
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-full border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground/30"
        >
          LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
        <span className="col-span-2 mt-1 inline-flex items-center gap-1.5 text-sm text-subtle sm:ml-1 sm:mt-0">
          <MapPin aria-hidden className="h-3.5 w-3.5" /> {profile.location}
        </span>
      </div>

      <dl className="reveal reveal-delay-3 mt-14 grid grid-cols-2 overflow-hidden rounded-2xl border bg-surface sm:grid-cols-4">
        {glance.map((g, i) => (
          <div
            key={g.label}
            className={`p-4 sm:p-5 ${i % 2 === 1 ? "border-l" : ""} ${i > 1 ? "border-t sm:border-t-0" : ""} ${
              i === 2 ? "sm:border-l" : ""
            }`}
          >
            <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">{g.label}</dt>
            <dd className="mt-1.5 text-sm font-medium sm:text-[15px]">{keepTogether(g.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
