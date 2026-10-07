import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { app, bus } from "@/lib/bus";
import { lockScroll } from "@/lib/scroll";
import { reducedMotion } from "@/lib/env";
import { hero, profile } from "@/content/site";
import { Monogram } from "./Monogram";

/** Carrega uma imagem e resolve mesmo se falhar (o preloader nunca trava). */
function loadImg(src: string) {
  return new Promise<void>((res) => {
    const i = new Image();
    i.onload = i.onerror = () => res();
    i.src = src;
  });
}

/** Frases de bastidor que acompanham o progresso. */
const STEPS: [number, string][] = [
  [0, "Acordando os pixels"],
  [28, "Polindo os anéis"],
  [58, "Afinando as animações"],
  [86, "Quase lá"],
  [100, "Pronto, pode entrar"],
];

/**
 * Preloader. O protagonista é o mesmo objeto 3D do hero (os anéis borromeanos, desenhados na cena
 * WebGL do site): eles começam soltos, apagados e girando no centro e se encaixam e acendem conforme
 * o carregamento real avança. Em 100% dão um estalo, o disco grafite se abre em círculo ao redor deles
 * e eles voam do centro para a posição do hero.
 *
 * Duas camadas: o fundo (abaixo do canvas 3D, para os anéis aparecerem por cima dele)
 * e os textos (acima de tudo).
 */
export function Preloader({ assets }: { assets: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const panel = panelRef.current!;
    const num = el.querySelector<HTMLElement>("[data-num]")!;
    const bar = el.querySelector<HTMLElement>("[data-bar]")!;
    const dial = panel.querySelector<HTMLElement>("[data-dial]")!;
    const arc = panel.querySelector<SVGCircleElement>("[data-arc]")!;
    const head = panel.querySelector<SVGCircleElement>("[data-head]")!;
    const marks = Array.from(panel.querySelectorAll<HTMLElement>("[data-mark]"));
    const step = el.querySelector<HTMLElement>("[data-step]")!;
    const word = el.querySelector<HTMLElement>("[data-word]")!;
    const reduce = reducedMotion();
    app.progress = 0;
    lockScroll(true);

    // ---- carregamento real: fontes + imagens críticas ----
    const state = { p: 0, target: 0 };
    let loaded = 0;
    const jobs: Promise<void>[] = [(document.fonts?.ready ?? Promise.resolve()).then(() => void 0), ...assets.map((a) => loadImg(a))];
    jobs.forEach((j) =>
      j.then(() => {
        loaded++;
        state.target = loaded / jobs.length;
      }),
    );

    // ---- entrada dos textos ----
    gsap.set(panel, { "--r": "0px" });
    if (!reduce) gsap.fromTo(dial, { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.8, ease: "expo.out", delay: 0.2 });
    else gsap.set([dial, ...el.querySelectorAll("[data-in],[data-cross]")], { autoAlpha: 1 });
    const intro = gsap.timeline();
    if (!reduce) {
      intro.fromTo(el.querySelectorAll("[data-in]"), { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.07, ease: "out" }, 0.15);
      intro.fromTo(el.querySelectorAll("[data-cross]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: "back.out(2)" }, 0.2);
    }

    // ---- frases de bastidor ----
    let stepIdx = -1;
    const setStep = (pct: number) => {
      let k = 0;
      STEPS.forEach(([t], i) => pct >= t && (k = i));
      if (k === stepIdx) return;
      stepIdx = k;
      if (reduce) step.textContent = STEPS[k][1];
      else gsap.to(step, { duration: 0.7, scrambleText: { text: STEPS[k][1], chars: "lowerCase", speed: 0.8 } });
    };

    // ---- disciplinas trocando ----
    let wi = 0;
    const words = hero.disciplines;
    const swap = reduce
      ? null
      : gsap.timeline({ repeat: -1, delay: 1.2 }).call(
          () => {
            wi = (wi + 1) % words.length;
            gsap.to(word, { duration: 0.7, scrambleText: { text: words[wi], chars: "01/<>_-.", speed: 0.5 } });
          },
          [],
          "+=1",
        );

    // ---- contador + progresso para a cena 3D ----
    const minTime = reduce ? 0.3 : 3.1;
    const t0 = performance.now();
    let finished = false;
    const tick = () => {
      const elapsed = (performance.now() - t0) / 1000;
      // enquanto a cena 3D compila (no máximo 6 s), o contador espera nos 25% para os anéis entrarem em sincronia
      const cap = app.sceneWait && elapsed < 6 ? 0.25 : 1;
      const goal = Math.min(state.target, Math.min(1, elapsed / minTime), cap);
      state.p += (goal - state.p) * 0.07;
      if (goal >= 1 && state.p > 0.995) state.p = 1;
      app.progress = state.p;
      const pct = Math.round(state.p * 100);
      num.textContent = String(pct).padStart(3, "0");
      bar.style.transform = `scaleX(${state.p})`;
      arc.style.strokeDashoffset = String(1 - state.p);
      const ang = state.p * Math.PI * 2 - Math.PI / 2;
      head.setAttribute("cx", String(Math.cos(ang) * 90));
      head.setAttribute("cy", String(Math.sin(ang) * 90));
      marks.forEach((m) => m.classList.toggle("!text-paper", pct >= Number(m.dataset.mark)));
      setStep(pct);
      if (state.p >= 1 && !finished) {
        finished = true;
        gsap.ticker.remove(tick);
        exit();
      }
    };
    gsap.ticker.add(tick);

    // ---- saída: estalo, disco se abre em círculo, anéis voam para o hero ----
    const exit = () => {
      swap?.kill();
      const R = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 60;
      const tl = gsap.timeline({ onComplete: () => setDone(true) });
      const reveal = () => {
        lockScroll(false);
        app.ready = true;
        bus.emit("ready");
      };
      if (reduce) {
        tl.to(el, { autoAlpha: 0, duration: 0.4 }).to(panel, { autoAlpha: 0, duration: 0.4 }, 0).call(reveal, [], 0.1);
        return;
      }
      tl.call(() => bus.emit("preload:done"), [], 0)
        .to(el.querySelectorAll("[data-out]"), { yPercent: -130, autoAlpha: 0, duration: 0.6, ease: "power3.in", stagger: 0.04 }, 0.5)
        .to(el.querySelectorAll("[data-cross]"), { scale: 0, autoAlpha: 0, duration: 0.5, ease: "power3.in", stagger: 0.03 }, 0.55)
        .to(bar, { scaleX: 0, transformOrigin: "right", duration: 0.5, ease: "power3.in" }, 0.5)
        .to(dial, { scale: 1.25, autoAlpha: 0, duration: 0.9, ease: "power3.in" }, 0.5)
        .call(reveal, [], 0.75)
        .to(panel, { "--r": `${R}px`, duration: 1.4, ease: "power3.inOut" }, 0.75);
    };

    return () => {
      gsap.ticker.remove(tick);
      swap?.kill();
      gsap.killTweensOf([step, word]);
      intro.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <>
      {/* fundo: fica abaixo do canvas 3D (z-30) para os anéis aparecerem por cima; tem um furo circular que cresce */}
      <div
        ref={panelRef}
        aria-hidden
        className="fixed inset-0 z-[25] bg-[#040405] [--r:0px]"
        style={{
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent var(--r), #000 calc(var(--r) + 1px))",
          maskImage: "radial-gradient(circle at 50% 50%, transparent var(--r), #000 calc(var(--r) + 1px))",
        }}
      >
        {/* mostrador técnico em volta dos anéis: escala girando, arco de progresso real e marcas de 0, 25, 50 e 75% */}
        <div data-dial className="pointer-events-none invisible absolute left-1/2 top-[46%] aspect-square w-[min(88vmin,820px)] -translate-x-1/2 -translate-y-1/2 opacity-0">
          <svg viewBox="-100 -100 200 200" className="h-full w-full overflow-visible" aria-hidden>
            <g className="origin-center animate-[dialspin_90s_linear_infinite]" style={{ transformOrigin: "0 0" }}>
              <circle r="97" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.6" strokeDasharray="0.5 7.88" />
              <circle r="90" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.35" />
            </g>
            <circle r="83" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.35" />
            <g transform="rotate(-90)">
              <circle data-arc r="90" fill="none" stroke="url(#dialg)" strokeWidth="0.9" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
            </g>
            <defs>
              <linearGradient id="dialg" x1="-90" y1="0" x2="90" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6f737a" />
                <stop offset="1" stopColor="#f4f5f8" />
              </linearGradient>
            </defs>
            <circle data-head r="1.7" cx="0" cy="-90" fill="var(--acc)" style={{ filter: "drop-shadow(0 0 3px var(--acc))" }} />
          </svg>
          {["00", "25", "50", "75"].map((t, i) => (
            <span key={t} data-mark={t} className="label absolute text-[10px] text-steel transition-colors duration-500" style={{ left: ["50%", "101%", "50%", "-1%"][i], top: ["-1.5%", "50%", "101.5%", "50%"][i], transform: "translate(-50%,-50%)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_46%,transparent,rgba(0,0,0,0.7))]" />
      </div>

      {/* textos: acima de tudo, sem fundo */}
      <div ref={root} className="pointer-events-none fixed inset-0 z-[100] text-paper" aria-live="polite" aria-label="Carregando">
        {/* cruzes de registro nos cantos */}
        {["left-[var(--gutter)] top-[calc(var(--header-h)+8px)]", "right-[var(--gutter)] top-[calc(var(--header-h)+8px)]", "left-[var(--gutter)] bottom-[88px]", "right-[var(--gutter)] bottom-[88px]"].map((pos) => (
          <span key={pos} data-cross data-out className={`invisible absolute h-3 w-3 opacity-0 ${pos}`}>
            <i className="absolute left-0 top-1/2 h-px w-full bg-white/30" />
            <i className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
          </span>
        ))}

        <div className="wrap absolute inset-x-0 top-0 flex h-[var(--header-h)] items-center justify-between">
          <div className="overflow-hidden">
            <div data-in data-out className="invisible opacity-0 flex items-center gap-3">
              <Monogram className="h-9 w-9" />
              <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:block">{profile.full}</span>
            </div>
          </div>
          <div className="overflow-hidden">
            <p data-in data-out className="invisible opacity-0 label text-silver-2">
              {hero.eyebrow}
            </p>
          </div>
        </div>

        {/* disciplina em destaque, logo abaixo dos anéis */}
        <div className="absolute inset-x-0 bottom-[22vh] flex justify-center max-md:bottom-[24vh]">
          <div className="overflow-hidden">
            <p data-in data-out className="invisible opacity-0 label-lg text-silver">
              <span data-word>{hero.disciplines[0]}</span>
            </p>
          </div>
        </div>

        <div className="wrap absolute inset-x-0 bottom-0 pb-6">
          <div className="flex items-end justify-between gap-6">
            <div className="overflow-hidden">
              <p data-in data-out className="invisible opacity-0 label flex items-center gap-2.5 text-steel">
                <span className="dot-live" />
                <span data-step>{STEPS[0][1]}</span>
              </p>
            </div>
            <div className="overflow-hidden">
              <p data-in data-out className="invisible opacity-0 font-mono text-[clamp(64px,12vw,180px)] font-light leading-[0.8] tracking-[-0.06em] tabular-nums">
                <span data-num className="text-chrome">
                  000
                </span>
                <span className="ml-1 align-top text-[0.28em] text-acc">%</span>
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
    </>
  );
}
