import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { env, q, qa } from './env';
import { wobble } from './wobble';

/** Hero intro (after the loader), slime highlight, photo parallax and tilt. */
export function initHero(ready: Promise<void>) {
  const title = q('[data-hero-title]');
  const copy = q('[data-hero-copy]');
  const art = q('[data-hero-art]');
  const smear = q('[data-hl-smear]');
  const drip = q('[data-hl-drip]');
  const fall = q('[data-hl-fall]');
  const tilt = q('[data-tilt]');
  const blob = q('[data-hero-blob]');
  if (!title || !copy || !art || !smear || !drip || !fall || !tilt || !blob) return;
  const logo = q('.drop-logo', art);

  gsap.set([copy.children, blob, tilt, logo], { autoAlpha: 0 });
  gsap.set(blob, { scale: 0.92, transformOrigin: '100% 100%' });
  gsap.set(tilt, { y: 36 });
  gsap.set(logo, { scale: 0, transformOrigin: '50% 50%' });

  ready.then(() => {
    gsap.set([title, copy, art], { visibility: 'visible' });
    // Split first: revert() restores the markup captured here, so the smear
    // and drip must still be in their natural (visible) state at this point.
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'hero-line' });
    gsap.set(smear, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(drip, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(fall, { autoAlpha: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: () => split.revert() });
    tl.from(split.lines, { yPercent: 115, duration: 1.1, stagger: 0.1 })
      .to(smear, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, '-=0.55')
      .to(drip, { scaleY: 1, duration: 0.45, ease: 'power2.out' }, '-=0.15')
      .fromTo(fall, { autoAlpha: 1, y: 0, scale: 0.6 }, { y: 46, scale: 1, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, '-=0.1')
      .to(copy.children, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, '-=1.1')
      .to(blob, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, '-=1.4')
      .to(tilt, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.8')
      .to(logo, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(2)' }, '-=0.7');
    gsap.set(copy.children, { y: 18 });
  });

  if (!env.mobile) {
    gsap.to(tilt, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: art, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to(blob, { yPercent: -5, ease: 'none', scrollTrigger: { trigger: art, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  if (env.fine) {
    // The only element on the site with a 3D tilt.
    art.style.perspective = '900px';
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    art.addEventListener('pointermove', (e) => {
      const r = tilt.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(gsap.utils.clamp(-7, 7, px * 14));
      rx(gsap.utils.clamp(-7, 7, -py * 14));
    });
    art.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  qa('.js-wobble').forEach(wobble);
}
