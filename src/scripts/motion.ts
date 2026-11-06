import gsap from 'gsap';

type Targets = Element | Element[] | (Element | Element[] | null | undefined)[] | null | undefined;

const flatten = (t: Targets): HTMLElement[] =>
  (Array.isArray(t) ? t.flat(2) : [t]).filter((el): el is HTMLElement => el instanceof Element);

/** will-change only while something is actually animating. */
export const hint = (targets: Targets) => flatten(targets).forEach((el) => (el.style.willChange = 'transform'));
export const unhint = (targets: Targets) => flatten(targets).forEach((el) => el.style.removeProperty('will-change'));

/** A scrubbed timeline that only hints the compositor while its trigger is active. */
export function scrubTimeline(targets: Targets, trigger: gsap.DOMTarget, start: string, end: string, scrub: number | boolean = true) {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub,
      onToggle: (self) => (self.isActive ? hint(targets) : unhint(targets)),
    },
  });
}
