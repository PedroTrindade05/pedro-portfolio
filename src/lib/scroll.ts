import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { reducedMotion } from "./env";

let lenis: Lenis | null = null;

/** Velocidade de rolagem suavizada (px/frame), útil para shaders e skew. */
export const scrollState = { y: 0, velocity: 0, direction: 1 };

export function initScroll() {
  if (lenis) return lenis;
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reducedMotion(),
    syncTouch: false,
  });
  lenis.on("scroll", (l: Lenis) => {
    scrollState.y = l.scroll;
    scrollState.velocity = l.velocity;
    scrollState.direction = l.direction || 1;
    ScrollTrigger.update();
  });
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function scrollToTarget(target: string | number | HTMLElement, opts: { offset?: number; immediate?: boolean; duration?: number } = {}) {
  if (lenis) lenis.scrollTo(target as never, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: opts.duration ?? 1.6 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: opts.immediate ? "auto" : "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: opts.immediate ? "auto" : "smooth" });
  }
}

export function lockScroll(lock: boolean) {
  if (lock) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle("is-locked", lock);
}
