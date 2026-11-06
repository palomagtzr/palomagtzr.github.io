import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { env, q } from './env';
import { moveLiveLights } from './slime';

const NS = 'http://www.w3.org/2000/svg';
/** Where the drips already painted in the wordmark end, in image coordinates (1800×504). */
const SOURCES = [
  { x: 140, y: 488 },
  { x: 615, y: 468 },
  { x: 1225, y: 458 },
  { x: 1670, y: 418 },
];
const FLOOR = 622;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

/** One drip: grows from the painted drip, falls with gravity, splashes, repeats at random intervals. */
function drip(svg: SVGSVGElement, src: { x: number; y: number }, delay: number) {
  const g = el('g', { style: 'filter:url(#slime-gloss-live)' });
  const body = el('path', { d: 'M0 -18 C7 -9 15 0 15 8 A15 15 0 1 1 -15 8 C-15 0 -7 -9 0 -18Z', fill: 'url(#slime-grad)' });
  const splash = el('g', { transform: `translate(${src.x} ${FLOOR})` });
  const bits = [-1, 0, 1].map((dir) => { const c = el('circle', { r: 7, cx: 0, cy: 0, fill: 'url(#slime-grad)', opacity: 0 }); splash.appendChild(c); return { c, dir }; });
  g.append(body, splash);
  svg.appendChild(g);

  gsap.set(body, { x: src.x, y: src.y, scale: 0, transformOrigin: '50% 0%' });

  const run = () => {
    const tl = gsap.timeline({ delay, onComplete: () => { delay = gsap.utils.random(1.6, 5.2); run(); } });
    tl.to(body, { scale: 1, scaleY: 1.25, duration: 0.9, ease: 'power1.inOut' })
      .to(body, { scaleY: 1.5, scaleX: 0.9, duration: 0.25, ease: 'power1.in' })
      .to(body, { y: FLOOR - 12, duration: 0.62, ease: 'power2.in' }, '<')
      .to(body, { scaleY: 0.25, scaleX: 1.9, autoAlpha: 0, duration: 0.22, ease: 'power2.out' })
      .set(body, { scale: 0, y: src.y, autoAlpha: 1 });
    bits.forEach(({ c, dir }, i) => {
      const dx = dir * gsap.utils.random(18, 34) + (dir === 0 ? gsap.utils.random(-8, 8) : 0);
      tl.fromTo(c, { opacity: 1, scale: 0.6, x: 0, y: 0 }, { x: dx, y: -gsap.utils.random(16, 30), scale: 1, duration: 0.2, ease: 'power2.out' }, 1.75 + i * 0.015)
        .to(c, { y: 8, opacity: 0, duration: 0.26, ease: 'power2.in' }, '>');
    });
    return tl;
  };
  return run();
}

/** Wordmark rises with a light squash and stretch; slime drips keep falling from it. */
export function initFooter() {
  const wordmark = q('[data-wordmark]');
  const svg = q<SVGSVGElement>('[data-drips]');
  const img = q('[data-wordmark-img]');
  if (!wordmark || !svg || !img) return;

  gsap.set(wordmark, { transformOrigin: '50% 100%' });
  gsap.timeline({ scrollTrigger: { trigger: wordmark, start: 'top 92%', once: true } })
    .from(wordmark, { y: 110, scaleY: 1.14, scaleX: 0.93, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
    .to(wordmark, { scaleY: 0.95, scaleX: 1.03, duration: 0.18, ease: 'power1.in' }, '-=0.25')
    .to(wordmark, { scaleY: 1, scaleX: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' });

  const sources = env.mobile ? [SOURCES[1], SOURCES[3]] : SOURCES;
  const loops = sources.map((s, i) => drip(svg, s, 0.6 + i * 0.9));
  loops.forEach((tl) => tl.pause());
  ScrollTrigger.create({
    trigger: wordmark,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => loops.forEach((tl) => (self.isActive ? tl.play() : tl.pause())),
  });

  if (!env.fine) return;
  // The specular highlight follows the pointer across the wordmark.
  let raf = 0;
  wordmark.addEventListener('pointerenter', () => img.classList.add('wordmark-shine'));
  wordmark.addEventListener('pointerleave', () => { img.classList.remove('wordmark-shine'); moveLiveLights(900, -200); });
  wordmark.addEventListener('pointermove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = img.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 1800;
      const y = ((e.clientY - r.top) / r.height) * 504;
      moveLiveLights(x, y - 120);
    });
  }, { passive: true });
}
