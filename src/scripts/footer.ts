import gsap from 'gsap';
import { q } from './env';

/** The wordmark rises with a light squash and stretch. */
export function initFooter() {
  const wordmark = q('[data-wordmark]');
  if (!wordmark) return;
  gsap.set(wordmark, { transformOrigin: '50% 100%' });
  gsap.timeline({ scrollTrigger: { trigger: wordmark, start: 'top 92%', once: true } })
    .from(wordmark, { y: 110, scaleY: 1.14, scaleX: 0.93, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
    .to(wordmark, { scaleY: 0.95, scaleX: 1.03, duration: 0.18, ease: 'power1.in' }, '-=0.25')
    .to(wordmark, { scaleY: 1, scaleX: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
}
