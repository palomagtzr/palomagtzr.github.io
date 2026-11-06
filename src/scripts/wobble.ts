import gsap from 'gsap';
import { env } from './env';

/** Gelatinous wobble on hover for the drop logo. */
export function wobble(el: Element) {
  if (!env.fine) return;
  el.addEventListener('pointerenter', () => {
    gsap.fromTo(
      el,
      { scaleX: 1.22, scaleY: 0.8 },
      { scaleX: 1, scaleY: 1, duration: 1.1, ease: 'elastic.out(1, 0.32)', transformOrigin: '50% 100%', overwrite: 'auto' },
    );
  });
}
