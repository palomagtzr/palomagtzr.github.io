import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { env, q, qa } from './env';
import { wobble } from './wobble';
import { hint, unhint, scrubTimeline } from './motion';

/** Hero intro (lines land as the curtain passes), slime highlight, photo parallax, blob drips. */
export function initHero(ready: Promise<void>, introShown: boolean) {
  const title = q('[data-hero-title]');
  const copy = q('[data-hero-copy]');
  const art = q('[data-hero-art]');
  const photo = q('[data-hero-photo]');
  const blob = q('[data-hero-blob]');
  const hl = q('[data-hl]');
  if (!title || !copy || !art || !photo || !blob || !hl) return;
  const logo = q('.drop-logo', art);
  const blobDrips = qa('[data-blob-drip]', blob);
  const parts = [title, copy, art];

  // With the intro on screen the hero is painted (LCP) but covered; hide it once
  // a frame has been painted, then animate it in under the sliding curtain.
  const hideNow = () => {
    gsap.set(parts, { visibility: 'hidden' });
    gsap.set(copy.children, { autoAlpha: 0, y: 18 });
    gsap.set(blob, { autoAlpha: 0, scale: 0.92, transformOrigin: '100% 100%' });
    gsap.set(photo, { autoAlpha: 0, y: 36 });
    gsap.set(logo, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
  };
  if (introShown) requestAnimationFrame(() => requestAnimationFrame(hideNow));
  else hideNow();

  ready.then(() => {
    gsap.set(parts, { visibility: 'visible' });
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'hero-line' });
    const targets = [split.lines, copy.children, blob, photo, logo];
    hint(targets);
    gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: () => unhint(targets) })
      .from(split.lines, { yPercent: 115, duration: 1, stagger: 0.12 }, 0.1)
      .add(() => { split.revert(); animateHighlight(); }, 1.0)
      .to(copy.children, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.6)
      .to(blob, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.3)
      .to(photo, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.55)
      .to(logo, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(2)' }, 0.95);
  });

  // The highlight is smeared on like slime; a drip grows under it.
  function animateHighlight() {
    const smear = q('[data-hl-smear]');
    const drip = q('[data-hl-drip]');
    if (!smear || !drip) return;
    gsap.timeline()
      .to(smear, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' })
      .to(drip, { scaleY: 1, duration: 0.5, ease: 'power2.out' }, '-=0.15');
  }

  // Hovering "tech" makes the smear tremble.
  if (env.fine) {
    hl.addEventListener('pointerenter', () => {
      const smear = q('[data-hl-smear]');
      if (smear) gsap.fromTo(smear, { scaleX: 1.08, scaleY: 0.86 }, { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'elastic.out(1, 0.3)', transformOrigin: '0% 50%', overwrite: true });
    });
  }

  // Scroll: soft parallax on the photo; the blob's drips run down toward project 01.
  gsap.set(blobDrips, { scaleY: 0.12 });
  const tl = scrubTimeline([photo, blobDrips], art, 'top 70%', 'bottom -10%', 0.4);
  if (!env.mobile) tl.fromTo(photo, { y: 0 }, { y: 48, ease: 'none' }, 0);
  tl.to(blobDrips, { scaleY: 1, ease: 'power1.in', stagger: 0.08 }, 0);

  qa('.js-wobble').forEach(wobble);
}
