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
  initProjects(lenis);
  initBand();
  initHow();
  initToolkit();
  initFooter();
  initCursor();
  // Positions are only trustworthy once fonts, section images and the intro are done.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh);
  document.fonts.ready.then(refresh);
  intro.then(refresh);
  const pending = Array.from(document.images).filter((img) => !img.complete);
  Promise.allSettled(pending.map((img) => new Promise<void>((r) => { img.addEventListener('load', () => r(), { once: true }); img.addEventListener('error', () => r(), { once: true }); }))).then(refresh);
}
