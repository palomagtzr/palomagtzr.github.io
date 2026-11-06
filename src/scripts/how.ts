import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { env, q, qa } from './env';
import { scrubTimeline } from './motion';

/** The slime band between Work and How: its drips lengthen as it scrolls past. */
export function initBand() {
  const band = q('[data-band]');
  if (!band) return;
  const drips = qa('[data-band-drip]', band);
  gsap.set(drips, { scaleY: 0.25 });
  scrubTimeline(drips, band, 'top 85%', 'bottom 20%', 0.5).to(drips, { scaleY: 1, ease: 'power1.inOut', stagger: 0.1 });
}

/** Giant words scrub in from alternating sides, word by word. */
export function initHow() {
  document.querySelectorAll<HTMLElement>('[data-habit]').forEach((habit) => {
    const fromLeft = habit.dataset.habit === 'left';
    const word = q('[data-word]', habit);
    const copy = q('[data-habit-copy]', habit);
    if (!word || !copy) return;
    const mover = word.closest('[data-design]')?.parentElement ?? word;
    const split = SplitText.create(word, { type: 'words', mask: 'words', wordsClass: 'how-word' });
    const smear = q('[data-design-smear]', habit);
    const logo = smear ? q('.drop-logo', habit) : null;

    // Everything is in place by the time the row reaches the centre of the viewport.
    const tl = scrubTimeline([mover, split.words, copy, smear].filter(Boolean) as Element[], habit, 'top 90%', 'center center', env.mobile ? 0.3 : 0.5);
    tl.fromTo(mover, { xPercent: fromLeft ? -26 : 26 }, { xPercent: 0, ease: 'none' }, 0)
      .from(split.words, { yPercent: 120, stagger: { each: 0.18, from: fromLeft ? 'start' : 'end' }, ease: 'power2.out' }, 0)
      .from(copy, { autoAlpha: 0, y: 18, ease: 'power2.out' }, 0.35);

    if (smear) {
      gsap.set(smear, { scaleX: 0, transformOrigin: '0% 50%' });
      tl.to(smear, { scaleX: 1, ease: 'power2.inOut' }, 0.05);
    }
    if (logo) {
      gsap.set(logo, { y: -60, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: habit,
        start: 'top 55%',
        once: true,
        onEnter: () =>
          gsap.timeline()
            .to(logo, { y: 0, autoAlpha: 1, duration: 1, ease: 'bounce.out' })
            .fromTo(logo, { scaleX: 1.25, scaleY: 0.8 }, { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'elastic.out(1, 0.3)', transformOrigin: '50% 100%' }, '-=0.15'),
      });
    }
  });
}
