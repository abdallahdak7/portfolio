import { work } from "@/content";
import { Section } from "./Section";

export function Work() {
  return (
    <Section id="work" label="02 — Selected work" title="Highlights">
      <div className="grid gap-4 sm:grid-cols-2">
        {work.map((item, i) => (
          <article
            key={item.title}
            className={`group flex flex-col rounded-2xl border bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.15)] ${
              i === 0 ? "sm:col-span-2" : ""
            }`}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{item.tag}</p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{item.description}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {item.stack.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
