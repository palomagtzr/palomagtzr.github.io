import { initWordmark } from './footer';

/** prefers-reduced-motion: everything in its final state, short fades only. */
export function initReduced() {
  initWordmark(false);
  const targets = document.querySelectorAll<HTMLElement>('[data-project], [data-habit], [data-toolkit-group], [data-wordmark]');
  targets.forEach((el) => el.classList.add('rm-fade'));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  targets.forEach((el) => io.observe(el));
}
