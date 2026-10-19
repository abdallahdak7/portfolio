import { Sparkles } from "lucide-react";
import { ai } from "@/content";
import { Section } from "./Section";

export function AI() {
  return (
    <Section id="ai" label="02 — AI" title="AI-first engineering">
      <div className="rounded-3xl border bg-surface p-6 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Part of my daily routine
        </div>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl">{ai.intro}</p>
        <div className="mt-10 grid gap-8 border-t pt-8 md:grid-cols-3 md:gap-6">
          {ai.pillars.map((p) => (
            <div key={p.title}>
              <h3 className="font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
