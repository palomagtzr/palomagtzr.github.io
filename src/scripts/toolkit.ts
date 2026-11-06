import gsap from 'gsap';
import { q, qa } from './env';
import { hint, unhint } from './motion';

/** One trigger for the section: rules draw left to right, tools rise in stagger. */
export function initToolkit() {
  const section = q('[data-toolkit]');
  if (!section) return;
  const rules = qa('[data-rule]', section);
  const tools = qa('[data-tool]', section);
  gsap.set(rules, { scaleX: 0 });
  gsap.set(tools, { y: 14, autoAlpha: 0 });
  gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 80%', once: true },
    onStart: () => hint([rules, tools]),
    onComplete: () => unhint([rules, tools]),
  })
    .to(rules, { scaleX: 1, duration: 0.9, ease: 'power3.inOut', stagger: 0.1 })
    .to(tools, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: 'power3.out' }, '-=0.7');
}
