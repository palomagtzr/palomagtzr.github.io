import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { q, qa } from './env';
import { hint, unhint } from './motion';

const NS = 'http://www.w3.org/2000/svg';
/** Where drips hang, as fractions of the wordmark width, with their size. */
const DRIPS: [number, number, number][] = [
  [0.07, 14, 62], [0.24, 11, 46], [0.41, 16, 74], [0.57, 12, 50], [0.76, 15, 66], [0.93, 10, 42],
];
const FLOOR_GAP = 56;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

/** Wave along the slime edge: amplitude varies so it reads as poured, not stamped. */
const waveY = (x: number, x0: number, w: number, edge: number) => edge + Math.sin((x - x0) / w * Math.PI * 13) * 9 + Math.sin((x - x0) / w * Math.PI * 5 + 1) * 7;

/** Fit the SVG to the text and draw the slime slab clipped to it. Runs with and without motion. */
function buildWordmark() {
  const svg = q<SVGSVGElement>('[data-wm-svg]');
  const text = q<SVGTextElement>('[data-wm-text]');
  const slab = q<SVGPathElement>('[data-wm-slab]');
  const shadow = q<SVGPathElement>('[data-wm-shadow]');
  const gloss = q<SVGGElement>('[data-wm-gloss]');
  const dripsG = q<SVGGElement>('[data-wm-drips]');
  if (!svg || !text || !slab || !shadow || !gloss || !dripsG) return null;

  const b = text.getBBox();
  const pad = 6;
  const x0 = b.x - pad, w = b.width + pad * 2, top = b.y, h = b.height;
  svg.setAttribute('viewBox', `${x0} ${top - 8} ${w} ${h + FLOOR_GAP + 24}`);

  const edge = top + h * 0.5;
  let d = `M${x0} ${top - h} L${x0 + w} ${top - h} L${x0 + w} ${waveY(x0 + w, x0, w, edge)}`;
  for (let x = x0 + w - 12; x >= x0; x -= 12) d += ` L${x.toFixed(1)} ${waveY(x, x0, w, edge).toFixed(1)}`;
  d += ' Z';
  slab.setAttribute('d', d);
  shadow.setAttribute('d', d);
  shadow.setAttribute('transform', 'translate(0 6)');

  gloss.replaceChildren();
  [0.05, 0.3, 0.52, 0.7, 0.9].forEach((f, i) => {
    const gx = x0 + w * f, gy = top + h * (0.12 + (i % 2) * 0.05);
    gloss.appendChild(el('path', { d: `M${gx} ${gy + 10} C${gx + 2} ${gy + 2} ${gx + 10} ${gy - 2} ${gx + 20} ${gy - 3}` }));
  });

  dripsG.replaceChildren();
  const drips = DRIPS.map(([f, dw, dh]) => {
    const x = x0 + w * f;
    const y = waveY(x, x0, w, edge) - 4;
    const u = el('use', { href: '#slime-drip', x: x - 16, y, width: 32, height: 100 });
    gsap.set(u, { scaleX: dw / 32, scaleY: dh / 100, transformOrigin: `${x}px ${y}px` });
    dripsG.appendChild(u);
    return { u, x, y, dw, dh };
  });
  return { svg, drips, floor: top + h + FLOOR_GAP - 10, text, edge };
}

/** Three reusable drops with their splash bits. */
function buildPool(svg: SVGSVGElement) {
  const g = q<SVGGElement>('[data-wm-drops]', svg)!;
  return [0, 1, 2].map(() => {
    const drop = el('use', { href: '#slime-drop', x: -17, y: -20, width: 34, height: 42 });
    const bits = [-1, 0, 1].map(() => el('circle', { r: 6, fill: 'url(#slime-grad)' }));
    const grp = el('g');
    grp.append(drop, ...bits);
    g.appendChild(grp);
    gsap.set(drop, { autoAlpha: 0, transformOrigin: '50% 0%' });
    gsap.set(bits, { autoAlpha: 0 });
    return { drop, bits };
  });
}

export function initWordmark(animate: boolean) {
  const link = q('[data-wordmark]');
  if (!link) return;
  const build = () => {
    const built = buildWordmark();
    if (!built || !animate) return;
    const wm = built;
    const slime = q('[data-wm-slime]')!;
    const pool = buildPool(wm.svg);
    let poured = false;
    let inView = false;
    let next = 0;
    let timer: gsap.core.Tween | null = null;

    // Slime pours down over the letters as the footer scrolls in.
    gsap.set(slime, { y: -(wm.text.getBBox().height + 20) });
    gsap.timeline({
      scrollTrigger: {
        trigger: link, start: 'top 96%', end: 'top 55%', scrub: 0.5,
        onToggle: (self) => (self.isActive ? hint(slime) : unhint(slime)),
        onUpdate: (self) => { if (!poured && self.progress > 0.98) { poured = true; schedule(); } },
      },
    }).to(slime, { y: 0, ease: 'none' });
    ScrollTrigger.create({ trigger: link, start: 'top bottom', end: 'bottom top', onToggle: (self) => { inView = self.isActive; if (inView && poured) schedule(); else timer?.kill(); } });

    function schedule() {
      timer?.kill();
      timer = gsap.delayedCall(gsap.utils.random(1.4, 3.6), fall);
    }
    /** A drip stretches, a drop lets go, falls with gravity and splashes on the floor. */
    function fall() {
      if (!inView) return;
      const d = wm.drips[Math.floor(Math.random() * wm.drips.length)];
      const { drop, bits } = pool[next++ % pool.length];
      const tipY = d.y + d.dh * 1.3;
      gsap.timeline({ onComplete: schedule })
        .to(d.u, { scaleY: (d.dh / 100) * 1.3, duration: 0.5, ease: 'power1.inOut' }, 0)
        .set(drop, { x: d.x, y: tipY, scale: 0.4, scaleX: 0.4, scaleY: 0.4, autoAlpha: 1 }, 0.3)
        .to(drop, { scale: 1, duration: 0.25, ease: 'power1.out' }, 0.3)
        .to(d.u, { scaleY: d.dh / 100, duration: 0.9, ease: 'elastic.out(1, 0.4)' }, 0.55)
        .to(drop, { y: wm.floor, scaleY: 1.4, scaleX: 0.9, duration: 0.55, ease: 'power2.in' }, 0.55)
        .to(drop, { scaleY: 0.3, scaleX: 1.8, autoAlpha: 0, duration: 0.2, ease: 'power2.out' }, 1.1)
        .fromTo(bits, { x: d.x, y: wm.floor, autoAlpha: 1, scale: 0.5 }, { x: (i) => d.x + (i - 1) * gsap.utils.random(16, 30), y: wm.floor - gsap.utils.random(14, 26), scale: 1, duration: 0.2, ease: 'power2.out', stagger: 0.015 }, 1.08)
        .to(bits, { y: wm.floor + 4, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 1.28);
    }
  };
  document.fonts.ready.then(build);
}

/** Footer: the wordmark rises once with a light squash and stretch. */
export function initFooter() {
  const wordmark = q('[data-wordmark]');
  if (!wordmark) return;
  gsap.set(wordmark, { transformOrigin: '50% 100%', y: 90, scaleY: 1.1, scaleX: 0.95, autoAlpha: 0 });
  gsap.timeline({
    scrollTrigger: { trigger: wordmark, start: 'top 95%', once: true },
    onStart: () => hint(wordmark),
    onComplete: () => unhint(wordmark),
  })
    .to(wordmark, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' })
    .to(wordmark, { scaleY: 0.96, scaleX: 1.02, duration: 0.16, ease: 'power1.in' }, '-=0.2')
    .to(wordmark, { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  initWordmark(true);
}
