import gsap from 'gsap';
import { env, q } from './env';

/** A small slime drop follows the pointer with inertia; grows and sticks on links. */
export function initCursor() {
  const cursor = q('[data-cursor]');
  const drop = q('[data-cursor-drop]');
  const trail = q('[data-cursor-trail]');
  if (!cursor || !drop || !trail || !env.fine) return;

  cursor.classList.remove('hidden');
  const mouse = { x: -200, y: -200 };
  const main = { x: -200, y: -200 };
  const tail = { x: -200, y: -200 };
  let stuck: HTMLElement | null = null;
  let visible = false;

  const setX = gsap.quickSetter(cursor, 'x', 'px');
  const setY = gsap.quickSetter(cursor, 'y', 'px');
  const setTx = gsap.quickSetter(trail, 'cx');
  const setTy = gsap.quickSetter(trail, 'cy');

  gsap.ticker.add((_t, dt) => {
    const k = 1 - Math.pow(0.0005, dt / 1000);
    let tx = mouse.x;
    let ty = mouse.y;
    if (stuck) {
      const r = stuck.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = cx + (mouse.x - cx) * 0.3;
      ty = cy + (mouse.y - cy) * 0.3;
    }
    main.x += (tx - main.x) * Math.min(1, k * 1.0);
    main.y += (ty - main.y) * Math.min(1, k * 1.0);
    tail.x += (main.x - tail.x) * Math.min(1, k * 0.45);
    tail.y += (main.y - tail.y) * Math.min(1, k * 0.45);
    setX(main.x);
    setY(main.y);
    setTx(gsap.utils.clamp(-40, 40, tail.x - main.x));
    setTy(gsap.utils.clamp(-40, 40, tail.y - main.y));
  });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!visible) { visible = true; gsap.to(cursor, { autoAlpha: 1, duration: 0.3 }); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { visible = false; gsap.to(cursor, { autoAlpha: 0, duration: 0.3 }); });

  const targets = 'a, button, [data-cursor-stick]';
  document.addEventListener('pointerover', (e) => {
    const el = (e.target as Element).closest<HTMLElement>(targets);
    if (!el || el === stuck) return;
    stuck = el;
    gsap.to(drop, { scale: 2.4, duration: 0.45, ease: 'elastic.out(1, 0.5)', transformOrigin: '50% 50%', overwrite: true });
    gsap.to(trail, { attr: { r: 9 }, duration: 0.3, overwrite: true });
  });
  document.addEventListener('pointerout', (e) => {
    const el = (e.target as Element).closest<HTMLElement>(targets);
    if (!el || el !== stuck) return;
    const to = e.relatedTarget as Element | null;
    if (to && el.contains(to)) return;
    stuck = null;
    gsap.to(drop, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)', overwrite: true });
    gsap.to(trail, { attr: { r: 5 }, duration: 0.3, overwrite: true });
  });
  document.addEventListener('pointerdown', () => gsap.fromTo(drop, { scaleY: 0.7, scaleX: 1.3 }, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }));
}
