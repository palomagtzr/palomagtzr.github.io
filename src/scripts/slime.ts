import gsap from 'gsap';
import { env, qa } from './env';

/** The slime "breathes": the turbulence frequency drifts very slowly. */
export function initSlimeBreathing() {
  if (env.mobile) return;
  qa<SVGFETurbulenceElement>('[data-breathe]').forEach((turb, i) => {
    gsap.to(turb, {
      attr: { baseFrequency: '0.017 0.038' },
      duration: 7 + i * 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });
}

/** Move every "live" point light to a position in the given coordinate space. */
export function moveLiveLights(x: number, y: number) {
  qa<SVGFEPointLightElement>('[data-light="live"]').forEach((light) => {
    light.setAttribute('x', String(Math.round(x)));
    light.setAttribute('y', String(Math.round(y)));
  });
}
