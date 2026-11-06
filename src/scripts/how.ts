import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { env, q } from './env';

/** Giant words scrub in from alternating sides; letters rise in stagger. */
export function initHow() {
  document.querySelectorAll<HTMLElement>('[data-habit]').forEach((habit) => {
    const fromLeft = habit.dataset.habit === 'left';
    const word = q('[data-word]', habit);
    const copy = q('[data-habit-copy]', habit);
    if (!word || !copy) return;
    const mover = word.closest('[data-design]')?.parentElement ?? word;
    const split = SplitText.create(word, { type: 'words,chars', mask: 'chars', charsClass: 'how-char', wordsClass: 'how-word' });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: habit, start: 'top 88%', end: env.mobile ? 'top 45%' : 'top 30%', scrub: env.mobile ? 0.4 : 0.8 },
    });
    tl.fromTo(mover, { xPercent: fromLeft ? -28 : 28 }, { xPercent: 0, ease: 'none' }, 0)
      .from(split.chars, { yPercent: 130, stagger: { each: 0.05, from: fromLeft ? 'start' : 'end' }, ease: 'power2.out' }, 0)
      .from(copy, { autoAlpha: 0, y: 18, ease: 'power2.out' }, 0.35);

    const smear = q('[data-design-smear]', habit);
    if (smear) {
      gsap.set(smear, { scaleX: 0, transformOrigin: '0% 50%' });
      tl.to(smear, { scaleX: 1, ease: 'power2.inOut' }, 0.05);
      const logo = q('.drop-logo', habit);
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
    }
  });
}
