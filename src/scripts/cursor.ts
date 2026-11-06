import gsap from 'gsap';
import { env, q } from './env';

/** A small yellow dot follows the pointer with inertia and grows over links. Transform only. */
export function initCursor() {
  const cursor = q('[data-cursor]');
  const dot = q('[data-cursor-dot]');
  if (!cursor || !dot || !env.fine) return;

  cursor.classList.remove('hidden');
  gsap.set(cursor, { autoAlpha: 0 });
  const toX = gsap.quickTo(cursor, 'x', { duration: 0.32, ease: 'power3' });
  const toY = gsap.quickTo(cursor, 'y', { duration: 0.32, ease: 'power3' });
  let visible = false;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    toX(e.clientX);
    toY(e.clientY);
    if (!visible) { visible = true; gsap.to(cursor, { autoAlpha: 1, duration: 0.25 }); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { visible = false; gsap.to(cursor, { autoAlpha: 0, duration: 0.25 }); });

  const targets = 'a, button';
  document.addEventListener('pointerover', (e) => {
    if ((e.target as Element).closest(targets)) gsap.to(dot, { scale: 2.6, duration: 0.45, ease: 'elastic.out(1, 0.5)', overwrite: true });
  });
  document.addEventListener('pointerout', (e) => {
    const el = (e.target as Element).closest(targets);
    if (el && !(e.relatedTarget && el.contains(e.relatedTarget as Node))) gsap.to(dot, { scale: 1, duration: 0.4, ease: 'power3.out', overwrite: true });
  });
}
