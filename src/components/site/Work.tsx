import { caseStudies } from "@/content";
import { Section } from "./Section";

const rows = [
  { key: "problem", label: "Problem" },
  { key: "role", label: "My role" },
  { key: "approach", label: "Approach" },
  { key: "outcome", label: "Outcome" },
] as const;

export function Work() {
  return (
    <Section id="work" label="02 — Case studies" title="Selected impact">
      <div className="space-y-5">
        {caseStudies.map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border bg-surface p-6 transition-colors duration-300 hover:border-foreground/20 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{c.tag}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{c.title}</h3>
              </div>
              {c.metric && (
                <span className="rounded-full bg-accent-soft px-3 py-1 font-mono text-sm font-medium text-accent">
                  {c.metric}
                </span>
              )}
            </div>
            <dl className="mt-6 space-y-4">
              {rows.map((r) => (
                <div key={r.key} className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-6">
                  <dt className={`text-sm font-medium ${r.key === "outcome" ? "text-accent" : ""}`}>{r.label}</dt>
                  <dd className={`text-[15px] leading-relaxed ${r.key === "outcome" ? "text-foreground" : "text-muted"}`}>
                    {c[r.key]}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {c.stack.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
