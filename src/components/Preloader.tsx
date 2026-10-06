import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { app, bus } from "@/lib/bus";
import { lockScroll } from "@/lib/scroll";
import { reducedMotion } from "@/lib/env";
import { hero } from "@/content/site";

/** Carrega uma imagem e resolve mesmo se falhar (o preloader nunca trava). */
function loadImg(src: string) {
  return new Promise<void>((res) => {
    const i = new Image();
    i.onload = i.onerror = () => res();
    i.src = src;
  });
}

/**
 * Preloader: contador mono de 000 a 100 enquanto fontes e imagens críticas carregam,
 * as disciplinas trocam embaralhando as letras, e a tela abre como uma persiana.
 */
export function Preloader({ assets }: { assets: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const num = el.querySelector<HTMLElement>("[data-num]")!;
    const bar = el.querySelector<HTMLElement>("[data-bar]")!;
    const word = el.querySelector<HTMLElement>("[data-word]")!;
    lockScroll(true);

    const state = { p: 0, target: 0 };
    let loaded = 0;
    const jobs: Promise<void>[] = [
      (document.fonts?.ready ?? Promise.resolve()).then(() => void 0),
      ...assets.map((a) => loadImg(a)),
    ];
    const total = jobs.length;
    jobs.forEach((j) =>
      j.then(() => {
        loaded++;
        state.target = loaded / total;
      }),
    );

    // troca das disciplinas
    let wi = 0;
    const words = hero.disciplines;
    const swap = gsap.timeline({ repeat: -1, repeatDelay: 0.25 });
    words.forEach(() => {
      swap.call(() => {
        wi = (wi + 1) % words.length;
        gsap.to(word, { duration: 0.6, scrambleText: { text: words[wi], chars: "01/<>_-.", speed: 0.6 } });
      }, [], "+=0.75");
    });

    const minTime = reducedMotion() ? 0.2 : 1.7;
    const t0 = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - t0) / 1000;
      const cap = Math.min(1, elapsed / minTime);
      const goal = Math.min(state.target, cap);
      state.p += (goal - state.p) * 0.08;
      if (goal >= 1 && state.p > 0.995) state.p = 1;
      num.textContent = String(Math.round(state.p * 100)).padStart(3, "0");
      bar.style.transform = `scaleX(${state.p})`;
      if (state.p >= 1) {
        gsap.ticker.remove(tick);
        exit();
      }
    };
    gsap.ticker.add(tick);

    const exit = () => {
      swap.kill();
      const tl = gsap.timeline({
        onComplete: () => {
          setDone(true);
        },
      });
      tl.to(el.querySelectorAll("[data-out]"), { yPercent: -120, duration: 0.7, ease: "power3.in", stagger: 0.04 })
        .to(bar, { scaleX: 0, transformOrigin: "right", duration: 0.6, ease: "power3.in" }, 0)
        .to(el.querySelector("[data-top]"), { yPercent: -100, duration: 1.1, ease: "inOut" }, 0.45)
        .to(el.querySelector("[data-bottom]"), { yPercent: 100, duration: 1.1, ease: "inOut" }, 0.45)
        .call(
          () => {
            lockScroll(false);
            app.ready = true;
            bus.emit("ready");
          },
          [],
          0.75,
        );
    };

    return () => {
      gsap.ticker.remove(tick);
      swap.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100] text-paper" aria-live="polite" aria-label="Carregando">
      <div data-top className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />

      <div className="wrap absolute inset-x-0 top-0 flex h-[var(--header-h)] items-center justify-between">
        <div className="overflow-hidden">
          <p data-out className="label text-silver-2">
            Pedro Trindade
          </p>
        </div>
        <div className="overflow-hidden">
          <p data-out className="label text-silver-2">
            {hero.eyebrow}
          </p>
        </div>
      </div>

      <div className="wrap absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center">
        <div className="overflow-hidden">
          <p data-out className="label-lg text-silver">
            <span data-word>{hero.disciplines[0]}</span>
          </p>
        </div>
      </div>

      <div className="wrap absolute inset-x-0 bottom-0 pb-6">
        <div className="flex items-end justify-between">
          <div className="overflow-hidden">
            <p data-out className="label text-steel">
              Carregando experiência
            </p>
          </div>
          <div className="overflow-hidden">
            <p data-out data-num className="font-mono text-[clamp(64px,12vw,180px)] font-light leading-[0.8] tracking-[-0.06em] text-chrome tabular-nums">
              000
            </p>
          </div>
        </div>
        <div className="relative mt-5 h-px w-full bg-white/10">
          <div data-bar className="absolute inset-0 origin-left bg-gradient-to-r from-silver-2 to-paper" style={{ transform: "scaleX(0)" }}>
            <span className="absolute -top-[2px] right-0 h-[5px] w-[5px] rounded-full bg-acc shadow-[0_0_10px_var(--acc)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
