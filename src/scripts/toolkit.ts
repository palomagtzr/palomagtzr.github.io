import gsap from 'gsap';
import { q, qa } from './env';

/** Rules draw left to right, tools rise in stagger. */
export function initToolkit() {
  qa('[data-toolkit-group]').forEach((group) => {
    const rule = q('[data-rule]', group);
    const tools = qa('[data-tool]', group);
    if (!rule) return;
    gsap.set(rule, { scaleX: 0 });
    gsap.timeline({ scrollTrigger: { trigger: group, start: 'top 88%', once: true } })
      .to(rule, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' })
      .from(tools, { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, '-=0.5');
  });
}
