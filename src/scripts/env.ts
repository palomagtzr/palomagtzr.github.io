const mq = (q: string) => window.matchMedia(q).matches;

/** Capability flags decided once at boot. */
export const env = {
  reduced: mq('(prefers-reduced-motion: reduce)'),
  fine: mq('(pointer: fine)') && mq('(hover: hover)'),
  mobile: mq('(max-width: 767px)'),
};

export const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
export const qa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));
