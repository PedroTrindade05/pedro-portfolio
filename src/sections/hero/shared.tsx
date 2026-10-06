import { useEffect } from "react";
import clsx from "clsx";
import { hero, profile } from "@/content/site";
import { gsap, SplitText } from "@/lib/gsap";
import { reducedMotion } from "@/lib/env";
import { scrollToTarget } from "@/lib/scroll";
import { Clock } from "@/components/Clock";

/** Linha de informações no topo do hero. */
export function HeroMeta({ className = "" }: { className?: string }) {
  return (
    <div data-parallax className={clsx("wrap absolute inset-x-0 top-[calc(var(--header-h)+14px)] grid grid-cols-2 items-start gap-4 text-silver-2 md:grid-cols-3", className)}>
      <p data-fade className="label">
        (00) {hero.eyebrow}
      </p>
      <p data-fade className="label hidden text-center md:block">
        {hero.disciplines.join("  ·  ")}
      </p>
      <p data-fade className="label text-right">
        <span className="hidden sm:inline">{profile.location} </span>
        <Clock className="ml-2 text-paper" />
      </p>
    </div>
  );
}

/** Rodapé do hero: disponibilidade e convite para rolar. */
export function HeroFoot({ hint }: { hint?: string }) {
  return (
    <div className="wrap absolute inset-x-0 bottom-6 flex items-end justify-between gap-6 text-silver-2">
      <p data-fade className="label flex items-center gap-2.5">
        <span className="dot-live" /> {profile.availability}
      </p>
      {hint && (
        <p data-fade className="label hidden text-center text-steel lg:block">
          {hint}
        </p>
      )}
      <button data-fade onClick={() => scrollToTarget("#sobre")} className="label hidden items-center gap-3 md:flex" data-cursor="link">
        {hero.scroll}
        <span className="relative block h-9 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_cubic-bezier(.76,0,.24,1)_infinite] bg-paper" />
        </span>
      </button>
    </div>
  );
}

/**
 * Entrada padrão: letras do nome sobem da máscara, blocos aparecem,
 * e na rolagem os blocos sobem e somem. Retorna a limpeza.
 */
export function heroIntro(el: HTMLElement, onStart?: (tl: gsap.core.Timeline) => void) {
  const reduce = reducedMotion();
  const words = el.querySelectorAll<HTMLElement>("[data-word]");
  const fades = el.querySelectorAll("[data-fade]");
  const splits = Array.from(words).map((n) => SplitText.create(n, { type: "chars", mask: "chars", charsClass: "split-char" }));
  const chars = splits.flatMap((s) => s.chars);
  gsap.set(chars, { yPercent: reduce ? 0 : 118 });
  gsap.set(fades, { autoAlpha: 0, y: reduce ? 0 : 16 });

  const start = () => {
    const tl = gsap.timeline({ defaults: { ease: "out" } });
    tl.to(chars, { yPercent: 0, duration: 1.4, stagger: { each: 0.03, from: "start" } }, 0.15);
    tl.to(fades, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.05 }, 0.45);
    onStart?.(tl);
  };

  gsap.to(el.querySelectorAll("[data-parallax]"), {
    y: -70,
    autoAlpha: 0,
    ease: "none",
    scrollTrigger: { trigger: el, start: "8% top", end: "55% top", scrub: true },
  });

  return {
    start,
    cleanup: () => splits.forEach((s) => s.revert()),
  };
}

/** Mantém o hero com a altura da tela mesmo quando a barra do navegador muda. */
export function useStableHeight() {
  useEffect(() => {
    const set = () => document.documentElement.style.setProperty("--hero-h", `${window.innerHeight}px`);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
}
