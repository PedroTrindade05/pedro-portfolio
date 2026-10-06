import { gsap, SplitText } from "./gsap";
import { reducedMotion } from "./env";

type RevealOpts = { delay?: number; start?: string; stagger?: number; duration?: number; trigger?: Element; immediate?: boolean };

/** Revela um texto linha a linha (máscara por linha), refazendo o split no resize. */
export function revealLines(el: Element, o: RevealOpts = {}) {
  if (reducedMotion()) return;
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 108,
        duration: o.duration ?? 1.15,
        ease: "out",
        stagger: o.stagger ?? 0.075,
        delay: o.delay ?? 0,
        scrollTrigger: o.immediate ? undefined : { trigger: o.trigger ?? el, start: o.start ?? "top 88%", once: true },
      });
    },
  });
}

/** Revela letras subindo de uma máscara. */
export function revealChars(el: Element, o: RevealOpts = {}) {
  if (reducedMotion()) return;
  return SplitText.create(el, {
    type: "chars",
    mask: "chars",
    charsClass: "split-char",
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.chars, {
        yPercent: 115,
        duration: o.duration ?? 1.2,
        ease: "out",
        stagger: o.stagger ?? 0.03,
        delay: o.delay ?? 0,
        scrollTrigger: o.immediate ? undefined : { trigger: o.trigger ?? el, start: o.start ?? "top 90%", once: true },
      });
    },
  });
}

/** Fade + subida simples para blocos. */
export function revealUp(targets: gsap.TweenTarget, trigger: Element, o: RevealOpts & { y?: number } = {}) {
  if (reducedMotion()) return;
  return gsap.from(targets, {
    y: o.y ?? 40,
    autoAlpha: 0,
    duration: o.duration ?? 1.1,
    ease: "out",
    stagger: o.stagger ?? 0.08,
    delay: o.delay ?? 0,
    scrollTrigger: { trigger, start: o.start ?? "top 85%", once: true },
  });
}
