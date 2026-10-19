import { experience, profile } from "@/content";
import { Section } from "./Section";

export function Experience() {
  return (
    <Section id="experience" label="01 — Experience" title="Where I've worked">
      <p className="mb-12 max-w-2xl leading-relaxed text-muted">{profile.summary}</p>
      <ol className="space-y-14">
        {experience.map((job) => (
          <li key={job.company} className="relative">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-lg font-semibold tracking-tight">{job.company}</h3>
              <span className="text-sm text-subtle">{job.location}</span>
            </div>
            {job.context && <p className="mt-0.5 text-sm text-muted">{job.context}</p>}

            <ol className="mt-5 space-y-6 border-l pl-6">
              {job.roles.map((role, i) => (
                <li key={role.title} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-[29px] top-[7px] h-2.5 w-2.5 rounded-full border-2 border-background ${
                      i === 0 ? "bg-accent" : "bg-border"
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
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-5 flex flex-wrap gap-1.5 pl-6">
              {job.stack.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
