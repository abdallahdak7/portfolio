import { about, skills } from "@/content";
import { Section } from "./Section";

export function About() {
  return (
    <Section id="about" label="03 — About" title="How I work">
      <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed text-muted">
        {about.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <dl className="mt-14 divide-y border-y">
        {skills.map((s) => (
          <div key={s.group} className="grid gap-2 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
            <dt className="text-sm font-medium">{s.group}</dt>
            <dd className="text-sm leading-relaxed text-muted">{s.items.join(" · ")}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
