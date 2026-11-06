import gsap from 'gsap';

type Target = Element | ArrayLike<Element> | null | undefined;
type Targets = Target | Target[];
type Styled = HTMLElement | SVGElement;

const flatten = (t: Targets): Styled[] => {
  const list: Target[] = Array.isArray(t) ? t : [t];
  return list
    .flatMap((x) => (x instanceof Element ? [x] : x ? Array.from(x) : []))
    .filter((el): el is Styled => el instanceof HTMLElement || el instanceof SVGElement);
};

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
