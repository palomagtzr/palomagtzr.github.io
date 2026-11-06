import gsap from 'gsap';
import { env, q, qa } from './env';
import { hint, unhint, scrubTimeline } from './motion';

/**
 * Each project: the panel rises 60 px and appears once, the copy enters line by
 * line; while leaving at the top the panel shrinks and dims (one scrubbed
 * timeline per article, which also drives the inner parallax).
 */
export function initProjects() {
  qa('[data-project]').forEach((article) => {
    const panel = article.matches('[data-panel]') ? article : q('[data-panel]', article);
    const copy = q('[data-project-copy]', article);
    if (!panel || !copy) return;
    const lines = Array.from(copy.children);
    const bars = qa('[data-bar]', article);

    gsap.set(panel, { y: 60, autoAlpha: 0 });
    gsap.set(lines, { y: 22, autoAlpha: 0 });
    const enter = gsap.timeline({
      scrollTrigger: { trigger: article, start: 'top 80%', once: true },
      onStart: () => hint([panel, lines]),
      onComplete: () => unhint([panel, lines]),
    })
      .to(panel, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, 0)
      .to(lines, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, 0.2);
    if (bars.length) enter.from(bars, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.8, ease: 'power3.out', stagger: 0.05 }, 0.3);

    const images = env.mobile ? [] : qa('[data-parallax]', article);
    const front = q('[data-window="front"]', article);
    const back = q('[data-window="back"]', article);
    const scrubbed = [panel, ...images, front, back].filter(Boolean) as Element[];
    const tl = scrubTimeline(scrubbed, article, 'top bottom', 'bottom top', 0.6);
    if (images.length) tl.fromTo(images, { yPercent: -4 }, { yPercent: 4, ease: 'none', duration: 1 }, 0);
    if (front && back) {
      tl.fromTo(front, { y: 22 }, { y: -16, ease: 'none', duration: 1 }, 0).fromTo(back, { y: -10 }, { y: 10, ease: 'none', duration: 1 }, 0);
    }
    // Leaving at the top: the previous section becomes a layer underneath.
    tl.to(panel, { scale: 0.96, opacity: 0.6, transformOrigin: '50% 100%', ease: 'none', duration: 0.38 }, 0.62);
  });
}
