import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { env } from './env';
import { initHeader } from './header';
import { initHero } from './hero';
import { initProjects } from './projects';
import { initBand, initHow } from './how';
import { initToolkit } from './toolkit';
import { initFooter } from './footer';
import { initReduced } from './reduced';
import { initIntro } from './intro';
import { initCursor } from './cursor';

gsap.registerPlugin(ScrollTrigger, SplitText);

if (env.reduced) {
  document.querySelector('[data-intro]')?.remove();
  initReduced();
  initHeader(null);
} else {
  const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const introShown = !document.documentElement.classList.contains('no-loader');
  const intro = document.fonts.ready.then(() => initIntro(lenis));
  initHero(intro, introShown);
  initHeader(lenis);
  initProjects();
  initBand();
  initHow();
  initToolkit();
  initFooter();
  initCursor();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
