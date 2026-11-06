import gsap from 'gsap';
import type Lenis from 'lenis';
import { env, q, qa } from './env';

/**
 * The logo is built, its drop falls and reveals the site.
 *   a. 0–0.8 s  black drop lands (scale 0.6 → 1, soft bounce)
 *   b. 0.8–2.0  slime pours from the tip and forms the three drips
 *   c. 2.0–2.8  a drop lets go, falls to the bottom edge and splats
 *   d. 2.8–3.6  the splat floods the screen, the curtain lifts with its drips,
 *               the logo shrinks and flies to the header
 * Resolves when the curtain starts moving. Skippable. ~3.8 s.
 */
export function initIntro(lenis: Lenis): Promise<void> {
  const intro = q('[data-intro]');
  const logo = q<SVGSVGElement>('[data-intro-logo]');
  const mark = q('[data-intro-mark]');
  const pour = q('[data-intro-pour]');
  const fall = q('[data-intro-fall]');
  const pool = q('[data-intro-pool]');
  const sheet = q('[data-intro-sheet]');
  const drips = qa('[data-intro-drip]');
  const skip = q<HTMLButtonElement>('[data-intro-skip]');
  const headerLogo = q('#site-header .drop-logo');
  const seen = document.documentElement.classList.contains('no-loader');
  if (!intro || !logo || !mark || !pour || !fall || !pool || !sheet || seen) {
    intro?.remove();
    return Promise.resolve();
  }
  try { sessionStorage.setItem('pg-loaded', '1'); } catch { /* private mode */ }

  lenis.stop();
  const vw = window.innerWidth, vh = window.innerHeight;
  const logoPx = env.mobile ? 150 : 190;
  const unit = 512 / logoPx; // viewBox units per CSS pixel
  const coverScale = (Math.hypot(vw / 2, vh) / 120) * 1.08;

  gsap.set(mark, { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%' });
  gsap.set(pour, { y: -360 });
  gsap.set(fall, { x: 256, y: 420, scale: 0, autoAlpha: 0, transformOrigin: '50% 0%' });
  gsap.set(pool, { scale: 0 });
  gsap.set(sheet, { autoAlpha: 0 });
  gsap.set(drips, { scaleY: 0.25 });
  if (headerLogo) gsap.set(headerLogo, { autoAlpha: 0 });

  // Where the header logo sits, relative to the intro logo's centre.
  const target = () => {
    const r = headerLogo?.getBoundingClientRect();
    if (!r || !r.width) return { x: 0, y: -vh / 2 - 100, scale: 0.2 };
    return { x: r.left + r.width / 2 - vw / 2, y: r.top + r.height / 2 - vh / 2, scale: r.width / logoPx };
  };

  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (done) return; done = true; resolve(); };
    const end = () => { if (headerLogo) gsap.set(headerLogo, { autoAlpha: 1 }); intro.remove(); lenis.start(); finish(); };
    const tl = gsap.timeline({ onComplete: end });
    tl.to(mark, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)' }, 0)
      .to(pour, { y: 0, duration: 1.2, ease: 'power1.inOut' }, 0.8)
      .to(fall, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 2.0)
      .to(fall, { y: 256 + (vh / 2) * unit, scaleY: 1.3, scaleX: 0.9, duration: 0.55, ease: 'power2.in' }, 2.25)
      .to(fall, { scaleY: 0.3, scaleX: 1.8, autoAlpha: 0, duration: 0.14, ease: 'power2.out' }, 2.8)
      .to(pool, { scale: coverScale, duration: 0.45, ease: 'power3.inOut' }, 2.82)
      .set(sheet, { autoAlpha: 1 }, 3.25)
      .set(pool, { autoAlpha: 0 }, 3.25)
      .add(finish, 3.25)
      .to(sheet, { yPercent: -100, duration: 0.72, ease: 'power3.inOut', willChange: 'transform' }, 3.25)
      .to(drips, { scaleY: 1, duration: 0.5, ease: 'power2.out', stagger: { each: 0.03, from: 'random' } }, 3.28)
      .to(drips, { y: 36, autoAlpha: 0, duration: 0.3, ease: 'power2.in', stagger: 0.02 }, 3.66)
      .to(logo, { ...target(), duration: 0.65, ease: 'power3.inOut' }, 3.2);

    skip?.addEventListener('click', () => { tl.progress(1); }, { once: true });
  });
}
