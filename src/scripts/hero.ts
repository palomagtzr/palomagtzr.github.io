import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { env, q, qa } from './env';
import { wobble } from './wobble';

/** Hero intro (after the loader), slime highlight, photo parallax and tilt. */
export function initHero(ready: Promise<void>) {
  const title = q('[data-hero-title]');
  const copy = q('[data-hero-copy]');
  const art = q('[data-hero-art]');
  const tilt = q('[data-tilt]');
  const blob = q('[data-hero-blob]');
  if (!title || !copy || !art || !tilt || !blob) return;
  const logo = q('.drop-logo', art);

  gsap.set([copy.children, blob, tilt, logo], { autoAlpha: 0 });
  gsap.set(blob, { scale: 0.92, transformOrigin: '100% 100%' });
  gsap.set(tilt, { y: 36 });
  gsap.set(logo, { scale: 0, transformOrigin: '50% 50%' });

  ready.then(() => {
    gsap.set([title, copy, art], { visibility: 'visible' });
    gsap.set(copy.children, { y: 18 });
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'hero-line' });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(split.lines, { yPercent: 115, duration: 1.1, stagger: 0.1 }, 0)
      // Masks would clip the drips, so restore the plain markup before the slime draws.
      .add(() => { split.revert(); animateHighlight(); }, 1.0)
      .to(copy.children, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.55)
      .to(blob, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.25)
      .to(tilt, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.5)
      .to(logo, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(2)' }, 0.9);
  });

  // The yellow highlight is smeared on like slime, then a small drop falls off it.
  function animateHighlight() {
    const smear = q('[data-hl-smear]');
    const drip = q('[data-hl-drip]');
    const fall = q('[data-hl-fall]');
    if (!smear || !drip || !fall) return;
    gsap.timeline()
      .to(smear, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' })
      .to(drip, { scaleY: 1, duration: 0.45, ease: 'power2.out' }, '-=0.15')
      .fromTo(fall, { autoAlpha: 1, y: 0, scale: 0.6 }, { y: 44, scale: 1, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, '-=0.1');
  }

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
