import { ArrowDown } from "lucide-react";
import { spotlight } from "@/content";
import { Section } from "./Section";

export function Spotlight() {
  return (
    <Section id="spotlight" label="04 — Spotlight" title="What I've built">
      <article className="rounded-3xl border bg-surface p-6 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{spotlight.tag}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{spotlight.title}</h3>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{spotlight.summary}</p>
        <dl className="mt-8 space-y-5 border-t pt-8">
          {spotlight.rows.map((r, i) => {
            const isResult = i === spotlight.rows.length - 1;
            return (
              <div key={r.label} className="grid gap-1 sm:grid-cols-[130px_1fr] sm:gap-6">
                <dt className={`text-sm font-medium ${isResult ? "text-accent" : ""}`}>{r.label}</dt>
                <dd className={`text-[15px] leading-relaxed ${isResult ? "text-foreground" : "text-muted"}`}>{r.text}</dd>
              </div>
            );
          })}
        </dl>
        <a
          href={spotlight.cta.href}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          {spotlight.cta.label} <ArrowDown aria-hidden className="h-4 w-4" />
        </a>
      </article>
    </Section>
  );
}
