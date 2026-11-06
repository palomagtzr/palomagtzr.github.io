import gsap from 'gsap';
import type Lenis from 'lenis';
import { env, q, qa } from './env';

/**
 * "The drop": a drop falls and splats, the splat floods the screen, PALOMA
 * lands letter by letter, then the slime curtain slides down and reveals the hero.
 * Resolves when the curtain starts moving so the hero can land underneath it.
 */
export function initIntro(lenis: Lenis): Promise<void> {
  const intro = q('[data-intro]');
  const drop = q('[data-intro-drop]');
  const pool = q('[data-intro-pool]');
  const sheet = q('[data-intro-sheet]');
  const letters = qa('[data-intro-letter]');
  const drips = qa('[data-intro-drip]');
  const skip = q<HTMLButtonElement>('[data-intro-skip]');
  const seen = document.documentElement.classList.contains('no-loader');
  if (!intro || !drop || !pool || !sheet || !letters.length || seen) {
    intro?.remove();
    return Promise.resolve();
  }
  try { sessionStorage.setItem('pg-loaded', '1'); } catch { /* private mode */ }

  lenis.stop();
  const coverScale = (Math.hypot(window.innerWidth, window.innerHeight) / 240) * 1.05;
  const fast = env.mobile ? 0.85 : 1;

  gsap.set(drop, { y: -(window.innerHeight * 0.6), transformOrigin: '50% 100%' });
  gsap.set(pool, { scale: 0 });
  gsap.set(sheet, { autoAlpha: 0 });
  gsap.set(letters, { yPercent: -130, autoAlpha: 0, transformOrigin: '50% 100%' });
  gsap.set(drips, { scaleY: 0.25 });

  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (done) return; done = true; resolve(); };
    const tl = gsap.timeline({ onComplete: () => { intro.remove(); lenis.start(); finish(); } });
    tl.to(drop, { y: 0, duration: 0.5 * fast, ease: 'power2.in' }, 0)
      .to(drop, { scaleX: 1.7, scaleY: 0.35, duration: 0.12, ease: 'power2.out' }, 0.5 * fast)
      .to(drop, { autoAlpha: 0, duration: 0.15 }, 0.56 * fast)
      .to(pool, { scale: coverScale, duration: 0.5 * fast, ease: 'power3.inOut' }, 0.52 * fast)
      .set(sheet, { autoAlpha: 1 }, 1.0 * fast)
      .set(pool, { autoAlpha: 0 }, 1.0 * fast)
      .to(letters, { yPercent: 0, autoAlpha: 1, duration: 0.42, ease: 'power2.in', stagger: 0.065 }, 0.78 * fast)
      .to(letters, { scaleY: 0.78, scaleX: 1.16, duration: 0.09, ease: 'power1.out', stagger: 0.065 }, 1.2 * fast)
      .to(letters, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)', stagger: 0.065 }, 1.29 * fast)
      .add(finish, 1.62 * fast)
      // The curtain lifts and reveals the hero from the bottom up; its drips stretch, then let go.
      .to(sheet, { yPercent: -100, duration: 0.75, ease: 'power3.inOut', willChange: 'transform' }, 1.62 * fast)
      .to(drips, { scaleY: 1, duration: 0.55, ease: 'power2.out', stagger: { each: 0.03, from: 'random' } }, 1.66 * fast)
      .to(drips, { y: 36, autoAlpha: 0, duration: 0.3, ease: 'power2.in', stagger: 0.02 }, 2.08 * fast);

    skip?.addEventListener('click', () => { tl.progress(1); }, { once: true });
  });
}
