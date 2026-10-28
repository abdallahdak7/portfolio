import { engineeringSkills, experience } from "@/content";
import { keepTogether } from "@/lib/text";
import { Section } from "./Section";

export function Experience() {
  return (
    <Section id="experience" label="01 — Experience" title="Where I've worked">
      <ol className="space-y-14">
        {experience.map((job) => (
          <li key={job.company} className="relative">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-lg font-semibold tracking-tight">{job.company}</h3>
              <span className="text-sm text-subtle">{job.location}</span>
            </div>
            {job.context && <p className="mt-0.5 text-sm text-muted">{job.context}</p>}

            <ol className="mt-5 space-y-6 border-l pl-6">
              {job.roles.map((role) => (
                <li key={role.title} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-[29px] top-[7px] h-2.5 w-2.5 rounded-full border-2 border-background ${
                      role.period.includes("Present") ? "bg-accent" : "bg-subtle/50"
                    }`}
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-medium">{role.title}</p>
                    <p className="font-mono text-xs text-subtle">{role.period}</p>
                  </div>
                  {role.points && (
                    <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted">
                      {role.points.map((p) => (
                        <li key={p} className="flex gap-3">
                          <span aria-hidden className="mt-[11px] h-px w-3 shrink-0 bg-subtle/60" />
                          <span>{keepTogether(p)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <div className="mt-14 border-t pt-8">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">Engineering</h3>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Engineering skills">
          {engineeringSkills.map((s) => (
            <li key={s} className="rounded-full border bg-surface px-3 py-1 text-sm text-muted">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
