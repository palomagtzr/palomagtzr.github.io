import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { env, q } from './env';
import { hint, unhint } from './motion';

import wordmark from '../data/wordmark.json';

const NS = 'http://www.w3.org/2000/svg';
/** Tips of the six hanging drips and the floor, in the wordmark's viewBox (from the build script). */
const TIPS = wordmark.tips as [number, number][];
const FLOOR = wordmark.floor;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

/** Three reusable drops (with splash bits) living in the wordmark's own coordinate space. */
function buildPool(g: SVGGElement) {
  return [0, 1, 2].map(() => {
    const drop = el('use', { href: '#slime-drop', x: -34, y: -40, width: 68, height: 84 });
    const bits = [-1, 0, 1].map(() => el('circle', { r: 11, fill: 'url(#slime-grad)' }));
    const grp = el('g');
    grp.append(drop, ...bits);
    g.appendChild(grp);
    gsap.set(drop, { autoAlpha: 0, transformOrigin: '50% 0%' });
    gsap.set(bits, { autoAlpha: 0 });
    return { drop, bits };
  });
}

/**
 * Footer: the wordmark rises once with a light squash and stretch, the slime
 * settles onto the letters, drops fall from its drips every 3–6 s, and the
 * slime trembles on hover. Transform/opacity only.
 */
export function initFooter() {
  const link = q('[data-wordmark]');
  const svg = q<SVGSVGElement>('[data-wm-svg]');
  const slime = q('#wm-slime');
  const gloss = q('#wm-gloss');
  const dropsG = q<SVGGElement>('[data-wm-drops]');
  if (!link || !svg || !slime || !gloss || !dropsG) return;
  const layers = [slime, gloss];

  gsap.set(link, { transformOrigin: '50% 100%', y: 90, scaleY: 1.1, scaleX: 0.95, autoAlpha: 0 });
  gsap.set(layers, { y: -14 });
  gsap.timeline({
    scrollTrigger: { trigger: link, start: 'top 92%', once: true },
    onStart: () => hint([link, ...layers]),
    onComplete: () => { unhint([link, ...layers]); schedule(); },
  })
    .to(link, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' })
    .to(link, { scaleY: 0.96, scaleX: 1.02, duration: 0.16, ease: 'power1.in' }, '-=0.2')
    .to(link, { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    .to(layers, { y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' }, '-=0.6');

  // Drops: a pool of three, reused.
  const pool = buildPool(dropsG);
  let inView = false;
  let settled = false;
  let next = 0;
  let timer: gsap.core.Tween | null = null;
  ScrollTrigger.create({ trigger: link, start: 'top bottom', end: 'bottom top', onToggle: (self) => { inView = self.isActive; if (inView) schedule(); else timer?.kill(); } });

  function schedule() {
    settled = true;
    timer?.kill();
    if (inView) timer = gsap.delayedCall(gsap.utils.random(3, 6), fall);
  }
  function fall() {
    if (!inView || !settled) return;
    const [tx, ty] = TIPS[Math.floor(Math.random() * TIPS.length)];
    const { drop, bits } = pool[next++ % pool.length];
    gsap.timeline({ onComplete: schedule })
      .set(drop, { x: tx, y: ty - 6, scale: 0.4, autoAlpha: 1 }, 0)
      .to(drop, { scale: 1, duration: 0.3, ease: 'power1.out' }, 0)
      .to(drop, { y: FLOOR, scaleY: 1.4, scaleX: 0.9, duration: 0.6, ease: 'power2.in' }, 0.3)
      .to(drop, { scaleY: 0.3, scaleX: 1.8, autoAlpha: 0, duration: 0.2, ease: 'power2.out' }, 0.9)
      .fromTo(bits, { x: tx, y: FLOOR, autoAlpha: 1, scale: 0.5 }, { x: (i) => tx + (i - 1) * gsap.utils.random(34, 60), y: FLOOR - gsap.utils.random(28, 50), scale: 1, duration: 0.2, ease: 'power2.out', stagger: 0.015 }, 0.88)
      .to(bits, { y: FLOOR + 8, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 1.08);
  }

  // Hover: the slime trembles once.
  if (env.fine) {
    link.addEventListener('pointerenter', () => {
      gsap.fromTo(layers, { scaleY: 1.03 }, { scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.35)', transformOrigin: '50% 0%', overwrite: 'auto' });
    });
  }
}
