import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { q, qa } from './env';
import { hint, unhint, scrubTimeline } from './motion';

/**
 * Each project, once: the panel colour pours in from the top, the content
 * appears, the number rolls like a counter and the copy enters line by line.
 * While leaving at the top the panel shrinks and dims (one scrubbed timeline per
 * article, which also drives the inner parallax). A sticky index follows along.
 */
export function initProjects(lenis: Lenis | null) {
  const links = qa<HTMLAnchorElement>('[data-index-link]');
  const marker = q('[data-index-marker]');
  const indexBox = q('[data-index]');

  qa('[data-project]').forEach((article, i) => {
    const panel = article.matches('[data-panel]') ? article : q('[data-panel]', article);
    const copy = q('[data-project-copy]', article);
    if (!panel || !copy) return;
    const pour = q('[data-pour]', panel);
    const content = qa('[data-panel-content]', panel);
    const lines = Array.from(copy.children);
    const bars = qa('[data-bar]', article);
    const cols = qa('[data-digit-col]', article);

    if (pour) gsap.set(pour, { yPercent: -100, y: -48 });
    gsap.set(cols, { y: 0, yPercent: 0 }); // columns rest on their final digit without JS; roll from 0 with it
    gsap.set(content, { autoAlpha: 0 });
    gsap.set(lines, { y: 22, autoAlpha: 0 });
    // Enter early and fast: the panel must be complete well before it reaches the centre.
    const enter = gsap.timeline({
      scrollTrigger: { trigger: article, start: 'top 100%', once: true },
      onStart: () => hint([pour, content, lines, cols]),
      onComplete: () => unhint([pour, content, lines, cols]),
    });
    if (pour) enter.to(pour, { yPercent: 0, y: 0, duration: 0.5, ease: 'power2.inOut' }, 0);
    enter.to(content, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, 0.2)
      .to(lines, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 0.15);
    cols.forEach((col, c) => enter.to(col, { yPercent: -Number(col.dataset.digitCol) * 10, duration: 1.1, ease: 'power4.inOut' }, 0.1 + c * 0.1));
    if (bars.length) enter.from(bars, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.8, ease: 'power3.out', stagger: 0.05 }, 0.5);

    // Screens sit exactly in their frames (no parallax, no scale); only the two
    // overlapping windows of the websites project drift apart.
    const front = q('[data-window="front"]', article);
    const back = q('[data-window="back"]', article);
    if (front && back) {
      scrubTimeline([front, back], article, 'top bottom', 'bottom top', 0.6)
        .fromTo(front, { y: 22 }, { y: -16, ease: 'none', duration: 1 }, 0)
        .fromTo(back, { y: -10 }, { y: 10, ease: 'none', duration: 1 }, 0);
    }
    // Leaving at the top: only once the panel's bottom has crossed the upper 60 % of the viewport.
    scrubTimeline(panel, panel, 'bottom 60%', 'bottom 0%', 0.4)
      .to(panel, { scale: 0.96, opacity: 0.6, transformOrigin: '50% 100%', ease: 'none' });

    // Sticky index: the slime drop slides to the project on screen.
    if (links.length && marker && indexBox) {
      const link = links[i];
      ScrollTrigger.create({
        trigger: article,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          links.forEach((l) => l.classList.toggle('is-active', self.isActive && l === link));
          if (!self.isActive || !link) return;
          const y = link.offsetTop + (link.offsetHeight - 17) / 2;
          gsap.timeline({ overwrite: true })
            .to(marker, { y, duration: 0.7, ease: 'power3.inOut' })
            .fromTo(marker, { scaleY: 1.3, scaleX: 0.85 }, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)', transformOrigin: '50% 0%' }, 0.45);
        },
      });
    }
  });

  if (marker) gsap.set(marker, { transformOrigin: '50% 0%' });
  links.forEach((link) => link.addEventListener('click', (e) => {
    const target = document.querySelector<HTMLElement>(link.hash);
    if (!target || !lenis) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -96, duration: 1.2 });
    history.pushState(null, '', link.hash);
  }));
}
