import type { ReactNode } from "react";

export function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t">
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-[200px_1fr] md:gap-16">
        <div>
          <p className="section-label">{label}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
