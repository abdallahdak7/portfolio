import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content";

export function Contact() {
  const links = [
    { label: "LinkedIn", href: profile.linkedin },
    { label: "GitHub", href: profile.github },
    { label: "Résumé (PDF)", href: profile.resume },
  ];

  return (
    <section id="contact" className="border-t">
      <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
        <p className="section-label">04 — Contact</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
          Have a role or project in mind? Let's talk.
        </h2>
        <a
          href={`mailto:${profile.email}`}
          className="mt-8 inline-block text-lg font-medium text-accent underline decoration-accent/30 underline-offset-[6px] transition-colors hover:decoration-accent sm:text-2xl"
        >
          {profile.email}
        </a>
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
