import { ArrowUpRight } from "lucide-react";
import { lookingFor, about } from "@/content";
import { analytics } from "@/lib/tom";
import { BookingLink } from "./BookingLink";

export function Contact() {
  const links = [
    { label: "LinkedIn", href: about.linkedin, onClick: () => analytics.contact("linkedin", "contact") },
    { label: "Résumé (PDF)", href: about.resume, onClick: () => analytics.resumeDownload("contact") },
    { label: "GitHub", href: about.github },
  ];
  const details = [
    { label: "Roles", value: lookingFor.roles },
    { label: "Location", value: lookingFor.where },
    { label: "Interests", value: lookingFor.domains },
  ];

  return (
    <section id="contact" className="border-t">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-32">
        <p className="section-label">06 — Contact</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
          {lookingFor.title}
        </h2>

        <dl className="mt-10 grid max-w-3xl gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3">
          {details.map((d) => (
            <div key={d.label} className="bg-surface p-5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">{d.label}</dt>
              <dd className="mt-1.5 text-sm font-medium">{d.value}</dd>
            </div>
          ))}
        </dl>

        <BookingLink
          from="contact"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-opacity hover:opacity-85"
        />
        <p className="mt-6 text-sm text-subtle">Or email</p>
        <a
          href={`mailto:${about.email}`}
          onClick={() => analytics.contact("email", "contact")}
          className="mt-1 inline-block text-lg font-medium text-accent underline decoration-accent/30 underline-offset-[6px] transition-colors hover:decoration-accent sm:text-2xl"
        >
          {about.email}
        </a>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                onClick={l.onClick}
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
