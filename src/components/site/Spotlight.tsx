import { spotlight } from "@/content";
import { Section } from "./Section";

export function Spotlight() {
  return (
    <Section id="spotlight" label="02 — Spotlight" title="What I've built">
      <article className="rounded-3xl border bg-surface p-6 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{spotlight.tag}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{spotlight.title}</h3>
        <dl className="mt-8 space-y-5">
          {spotlight.rows.map((r) => {
            const isImpact = r.label === "Impact";
            return (
              <div key={r.label} className="grid gap-1 sm:grid-cols-[130px_1fr] sm:gap-6">
                <dt className={`text-sm font-medium ${isImpact ? "text-accent" : ""}`}>{r.label}</dt>
                <dd className={`text-[15px] leading-relaxed ${isImpact ? "text-foreground" : "text-muted"}`}>{r.text}</dd>
              </div>
            );
          })}
        </dl>
      </article>
    </Section>
  );
}
