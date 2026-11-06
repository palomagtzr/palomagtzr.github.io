import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { env } from './env';
import { initHeader } from './header';
import { initHero } from './hero';
import { initProjects } from './projects';
import { initHow } from './how';
import { initToolkit } from './toolkit';
import { initFooter } from './footer';
import { initReduced } from './reduced';
import { initLoader } from './loader';
import { initCursor } from './cursor';
import { initSlimeBreathing } from './slime';

gsap.registerPlugin(ScrollTrigger, SplitText);

if (env.reduced) {
  document.querySelector('[data-loader]')?.remove();
  initReduced();
  initHeader(null);
} else {
  const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const loaded = initLoader(lenis);
  const ready = Promise.all([document.fonts.ready, loaded]).then(() => undefined);

  initHeader(lenis);
  initHero(ready);
  initProjects();
  initHow();
  initToolkit();
  initFooter();
  initCursor();
  initSlimeBreathing();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
