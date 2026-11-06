import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { env, q, qa } from './env';

/** Hide on scroll down, show on scroll up, mark the active section, animate the slime edge. */
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
      const focusTarget = () => { target.tabIndex = -1; target.focus({ preventScroll: true }); };
      if (lenis) lenis.scrollTo(target, { offset: a.hash === '#top' ? 0 : -72, duration: 1.2, onComplete: focusTarget });
      else { target.scrollIntoView(); focusTarget(); }
      history.pushState(null, '', a.hash);
    });
  });

  if (lenis) initSlimeEdge(lenis, header);
}

/**
 * The drips on the header's slime edge stretch with scroll velocity and snap
 * back with an elastic bounce when you stop. Every 8–12 s of scrolling one
 * drip lets go: a small drop falls a few pixels and fades.
 */
function initSlimeEdge(lenis: Lenis, header: HTMLElement) {
  const drips = qa<SVGSVGElement>('[data-edge-drip]', header);
  if (!drips.length) return;
  const setters = drips.map((d) => gsap.quickSetter(d, 'scaleY'));
  // A pool of three falling drops, created once and reused (no DOM churn on release).
  const pool = [0, 1, 2].map(() => {
    const drop = drips[0].cloneNode(true) as SVGSVGElement;
    drop.removeAttribute('data-edge-drip');
    drop.style.height = '12px';
    drop.style.visibility = 'hidden';
    drips[0].parentElement!.appendChild(drop);
    return drop;
  });
  let next = 0;
  let stretch = 0;
  let velocity = 0;
  let moving = false;
  let scrollTime = 0;
  let nextRelease = gsap.utils.random(8, 12);
  let lastT = 0;

  lenis.on('scroll', ({ velocity: v }) => { velocity = v; });

  gsap.ticker.add((t) => {
    const dt = lastT ? Math.min(0.05, t - lastT) : 0.016;
    lastT = t;
    const target = gsap.utils.clamp(0, 1, Math.abs(velocity) / 28);
    velocity *= 0.9;
    if (target > 0.02) {
      if (!moving) { moving = true; gsap.killTweensOf(drips); }
      stretch += (target - stretch) * 0.18;
      setters.forEach((set, i) => set(1 + stretch * (0.9 + (i % 3) * 0.25)));
      scrollTime += dt;
      if (scrollTime > nextRelease) { scrollTime = 0; nextRelease = gsap.utils.random(8, 12); release(drips[Math.floor(Math.random() * drips.length)]); }
    } else if (moving) {
      moving = false;
      stretch = 0;
      gsap.to(drips, { scaleY: 1, duration: 1.1, ease: 'elastic.out(1, 0.35)', overwrite: true });
    }
  });

  function release(from: SVGSVGElement) {
    const drop = pool[next++ % pool.length];
    gsap.killTweensOf(drop);
    drop.style.left = from.style.left;
    gsap.set(drop, { y: from.getBoundingClientRect().height - 4, scaleY: 1, scaleX: 1, autoAlpha: 1 });
    gsap.to(drop, { y: '+=56', autoAlpha: 0, duration: 0.8, ease: 'power2.in' });
  }
}
