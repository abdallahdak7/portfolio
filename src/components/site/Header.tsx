import { useEffect, useState } from "react";
import { profile } from "@/content";

const links = [
  { href: "#experience", label: "Experience" },
  { href: "#leadership", label: "Approach" },
  { href: "#ai", label: "AI" },
  { href: "#spotlight", label: "Spotlight" },
  { href: "#ask-tom", label: "Ask Tom" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b bg-background/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="text-sm font-semibold tracking-tight">
          {profile.name}
        </a>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground sm:inline-block"
            >
              {l.label}
            </a>
          ))}
          <a
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            className="ml-1 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            Résumé
          </a>
        </nav>
      </div>
    </header>
  );
}
