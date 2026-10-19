import { skills } from "@/content";
import { Section } from "./Section";

export function Skills() {
  return (
    <Section id="skills" label="04 — Skills" title="What I bring">
      <dl className="divide-y border-y">
        {skills.map((s) => (
          <div key={s.group} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
            <dt className="text-sm font-medium">{s.group}</dt>
            <dd className="text-sm leading-relaxed text-muted">{s.items.join(" · ")}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
