// Ambient effects: pointer spotlight on the grid, per-card glow, scroll reveal.
// Framework-agnostic; call once after the app mounts.
export function initAmbient(): void {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const CARDS = 'main article.border, main div.rounded-3xl.border, #top dl.border';

  if (fine && !reduce) {
    let raf = 0, x = 0, y = 0;
    let target: EventTarget | null = null;
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY; target = e.target;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty('--mx', x + 'px');
        root.style.setProperty('--my', y + 'px');
        root.classList.add('pointer-on');
        const card = target instanceof Element ? target.closest<HTMLElement>(CARDS) : null;
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--cx', x - r.left + 'px');
          card.style.setProperty('--cy', y - r.top + 'px');
        }
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('pointer-on'));
  }

  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    document.querySelectorAll<HTMLElement>("main > section:not(#top) > div").forEach((el) => io.observe(el));
  }
}
