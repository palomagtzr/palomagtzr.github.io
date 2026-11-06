import gsap from 'gsap';
import type Lenis from 'lenis';
import { env, q, qa } from './env';

/**
 * First visit of the session only: the drop fills with slime from the bottom,
 * drips once and then falls away, revealing the hero. Max 1.4 s.
 */
export function initLoader(lenis: Lenis): Promise<void> {
  const loader = q('[data-loader]');
  const drop = q('[data-loader-drop]');
  const level = q('[data-loader-level]');
  const drip = q('[data-loader-drip]');
  const skip = document.documentElement.classList.contains('no-loader');
  if (!loader || !drop || !level || !drip || skip) {
    loader?.remove();
    return Promise.resolve();
  }
  try { sessionStorage.setItem('pg-loaded', '1'); } catch { /* private mode */ }

  lenis.stop();
  if (env.mobile) qa<SVGGElement>('g[style]', loader).forEach((g) => (g.style.filter = 'none'));
  gsap.set(level, { y: 0 });
  gsap.set(drip, { scale: 0, transformOrigin: '50% 0%', autoAlpha: 0 });

  return new Promise((resolve) => {
    gsap.timeline({
      onComplete: () => { loader.remove(); lenis.start(); },
    })
      .to(level, { y: -372, duration: 0.72, ease: 'power2.inOut' }, 0)
      .to(drip, { autoAlpha: 1, scale: 1, duration: 0.22, ease: 'power2.out' }, 0.62)
      .to(drip, { y: 50, scaleY: 1.5, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0.84)
      .to(drop, { y: '120vh', scaleY: 1.12, transformOrigin: '50% 0%', duration: 0.42, ease: 'power3.in' }, 0.92)
      .add(resolve, 1.05)
      .to(loader, { autoAlpha: 0, duration: 0.32, ease: 'power1.out' }, 1.05);
  });
}
