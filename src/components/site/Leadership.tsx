import { leadershipIntro, principles, profile } from "@/content";
import { Section } from "./Section";

export function Leadership() {
  return (
    <Section id="leadership" label="01 — Leadership" title="How I lead">
      <p className="max-w-2xl text-[17px] leading-relaxed text-muted">{leadershipIntro}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {principles.map((p, i) => (
          <article key={p.title} className="rounded-2xl border bg-surface p-6">
            <p className="font-mono text-xs text-accent">0{i + 1}</p>
            <h3 className="mt-3 font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-subtle">{profile.summary}</p>
    </Section>
  );
}
