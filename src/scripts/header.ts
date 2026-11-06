import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { env, q, qa } from './env';

/** Hide on scroll down, show on scroll up, mark the active section. */
export function initHeader(lenis: Lenis | null) {
  const header = q('#site-header');
  if (!header) return;
  const links = qa<HTMLAnchorElement>('.nav-link');

  if (lenis && !env.mobile) {
    let hidden = false;
    const show = () => { hidden = false; gsap.to(header, { yPercent: 0, duration: 0.5, ease: 'power3.out', overwrite: true }); };
    const hide = () => { hidden = true; gsap.to(header, { yPercent: -100, duration: 0.45, ease: 'power3.in', overwrite: true }); };
    lenis.on('scroll', ({ scroll, direction }) => {
      if (scroll < 24) { if (hidden) show(); return; }
      if (direction === 1 && !hidden && scroll > 140) hide();
      else if (direction === -1 && hidden) show();
    });
    header.addEventListener('focusin', () => { if (hidden) show(); });
  }

  qa('section[data-section], footer[data-section]').forEach((section) => {
    const id = section.getAttribute('data-section');
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => links.forEach((l) => l.classList.toggle('is-active', self.isActive && l.dataset.section === id)),
    });
  });

  qa<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = a.hash.length > 1 ? document.querySelector<HTMLElement>(a.hash) : document.body;
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: a.hash === '#top' ? 0 : -72, duration: 1.2 });
      else target.scrollIntoView();
      history.pushState(null, '', a.hash);
    });
  });
}
