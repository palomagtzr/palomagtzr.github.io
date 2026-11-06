import gsap from 'gsap';
import { env, q, qa } from './env';

/** Panels clip in, numbers slide in, screenshots drift inside their frames. */
export function initProjects() {
  qa('[data-project]').forEach((article) => {
    const panel = article.matches('[data-panel]') ? article : q('[data-panel]', article);
    const number = q('[data-number]', article);
    if (!panel || !number) return;
    const copy = Array.from(number.parentElement!.children).filter((el) => el !== number);

    gsap.fromTo(
      panel,
      { clipPath: 'inset(12% round 36px)', scale: 0.94 },
      { clipPath: 'inset(0% round 36px)', scale: 1, duration: 1.2, ease: 'power3.out', clearProps: 'clipPath', scrollTrigger: { trigger: panel, start: 'top 82%', once: true } },
    );
    gsap.from(number, { x: -32, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: number, start: 'top 90%', once: true } });
    gsap.from(copy, { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: number, start: 'top 90%', once: true } });

    const bars = qa('[data-bar]', article);
    if (bars.length) {
      gsap.from(bars, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 70%', once: true } });
    }

    const front = q('[data-window="front"]', article);
    const back = q('[data-window="back"]', article);
    if (front && back) {
      const st = { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true } as const;
      gsap.fromTo(front, { y: 26 }, { y: -18, ease: 'none', scrollTrigger: st });
      gsap.fromTo(back, { y: -12 }, { y: 12, ease: 'none', scrollTrigger: st });
    }
  });

  if (env.mobile) return;
  qa('[data-frame]').forEach((frame) => {
    const img = q('[data-parallax]', frame);
    if (!img) return;
    gsap.set(img, { scale: 1.14 });
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
