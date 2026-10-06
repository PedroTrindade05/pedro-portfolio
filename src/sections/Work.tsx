import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { projects, type Project } from "@/content/work";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { revealLines } from "@/lib/reveal";
import { reducedMotion } from "@/lib/env";
import { lockScroll } from "@/lib/scroll";
import { showcase } from "@/gl/showcase";
import { stage } from "@/gl/stage";
import { SectionLabel, Arrow, Btn } from "@/components/ui";
import { useGo } from "@/components/Transition";

const AUTOPLAY = 6000;

/**
 * Trabalhos: vitrine 3D com um projeto em foco e os vizinhos visíveis no trilho.
 * Tudo aparece sem hover: arraste, setas, miniaturas ou avanço automático.
 * Clicar no projeto em foco abre o case com a capa crescendo até a tela cheia.
 */
export function Work() {
  const [active, setActive] = useState(() => showcase.active);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const go = useGo();
  const gl = stage.ok;
  const p = projects[active] ?? projects[0];

  // liga a camada WebGL ao palco
  useEffect(() => {
    if (!gl) return;
    showcase.attach();
    showcase.setItems(projects.map((x) => x.cover));
    showcase.bind(stageRef.current);
    showcase.onChange = (i) => setActive(i);
    showcase.load();
    return () => {
      showcase.onChange = null;
      showcase.bind(null);
    };
  }, [gl]);

  const root = useGsap<HTMLElement>((el) => {
    el.querySelectorAll("[data-lines]").forEach((t) => revealLines(t));
    const st = ScrollTrigger.create({
      trigger: stageRef.current,
      start: "top 85%",
      end: "bottom 10%",
      onToggle: (s) => setInView(s.isActive),
      onEnter: () => gsap.to(showcase, { appear: 1, duration: reducedMotion() ? 0.01 : 2, ease: "expo.out" }),
    });
    if (!reducedMotion()) {
      gsap.from(el.querySelectorAll("[data-thumb]"), {
        y: 30,
        autoAlpha: 0,
        stagger: 0.04,
        duration: 0.9,
        ease: "out",
        scrollTrigger: { trigger: el.querySelector("[data-thumbs]"), start: "top 95%", once: true },
      });
    }
    return () => st.kill();
  });

  // avanço automático enquanto a seção está na tela e ninguém mexe
  useEffect(() => {
    if (!inView || paused || reducedMotion()) return;
    const id = setTimeout(() => (gl ? showcase.step(1) : setActive((a) => (a + 1) % projects.length)), AUTOPLAY);
    return () => clearTimeout(id);
  }, [active, inView, paused, gl]);

  // teclado
  useEffect(() => {
    if (!inView) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const move = (dir: number) => {
    if (gl) showcase.step(dir);
    else setActive((a) => (a + dir + projects.length) % projects.length);
  };
  const jump = (i: number) => {
    if (gl) showcase.goTo(i);
    else setActive(i);
  };

  const open = async (proj: Project) => {
    if (!gl || reducedMotion()) {
      go(`/trabalhos/${proj.slug}`, { label: proj.title });
      return;
    }
    lockScroll(true);
    showcase.goTo(projects.indexOf(proj));
    await new Promise((r) => setTimeout(r, Math.abs(showcase.target - showcase.progress) > 0.05 ? 450 : 0));
    await showcase.open();
    navigate(`/trabalhos/${proj.slug}`, { state: { fromPreview: true } });
    lockScroll(false);
  };

  // arrastar (mouse e toque) com inércia; um toque sem arrasto no card ativo abre o case
  const drag = useRef({ x: 0, start: 0, moved: false, t: 0 });
  const onDown = (e: React.PointerEvent) => {
    if (!gl) return;
    drag.current = { x: e.clientX, start: showcase.target, moved: false, t: performance.now() };
    showcase.dragging = true;
    setPaused(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const r = showcase.activeRect();
    const el = stageRef.current!;
    if (r) {
      const over = e.clientX > r.x && e.clientX < r.x + r.w && e.clientY > r.y && e.clientY < r.y + r.h;
      const next = over ? "view" : "drag";
      if (el.dataset.cursor !== next) {
        el.dataset.cursor = next;
        el.dataset.cursorLabel = over ? "Ver case" : "Arraste";
        window.dispatchEvent(new Event("cursor:refresh"));
      }
    }
    if (!showcase.dragging) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 6) drag.current.moved = true;
    const width = r?.w ?? 600;
    showcase.target = drag.current.start - dx / (width * 0.75);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!showcase.dragging) return;
    showcase.dragging = false;
    if (!drag.current.moved) {
      // clique: ativo abre, lados navegam
      const r = showcase.activeRect();
      if (r && e.clientX > r.x && e.clientX < r.x + r.w && e.clientY > r.y && e.clientY < r.y + r.h) open(projects[showcase.active]);
      else if (r) move(e.clientX < r.x ? -1 : 1);
    } else {
      showcase.target = Math.round(showcase.target - showcase.velocity * 0.12);
    }
    setTimeout(() => setPaused(false), 2500);
  };

  const idx = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <section ref={root} id="trabalhos" data-theme="dark" className="relative overflow-hidden pb-[12vh] pt-[16vh]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionLabel n="02" className="text-silver-2">
              Trabalhos selecionados
            </SectionLabel>
            <h2 data-lines className="h1 mt-8 max-w-[12ch]">
              Projetos que já estão no mundo
            </h2>
          </div>
        </div>
      </div>

      {/* palco 3D */}
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Vitrine de projetos"
        data-cursor="drag"
        data-cursor-label="Arraste"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (showcase.dragging = false)}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="relative mt-[5vh] h-[min(64vw,560px)] touch-pan-y select-none md:h-[min(39vw,700px)]"
      >
        {!gl && <FallbackSlides active={active} onOpen={open} />}
      </div>

      {/* painel do projeto em foco */}
      <div className="wrap mt-6 md:mt-2">
        <div className="grid gap-8 border-t border-white/10 pt-8 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5">
            <p className="label flex flex-wrap items-center gap-3 text-silver-2">
              <span className="text-acc">({idx(active)})</span>
              {p.category}
              <span className="opacity-40">/</span>
              {p.year}
              <span className="opacity-40">/</span>
              {p.client}
            </p>
            <ActiveTitle key={p.slug} title={p.title} />
          </div>
          <div className="md:col-span-4">
            <SwapText key={p.slug}>
              <p className="text-[16px] leading-relaxed text-silver">{p.summary}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.stack.slice(0, 4).map((s) => (
                  <span key={s} className="chip text-silver-2">
                    {s}
                  </span>
                ))}
              </div>
            </SwapText>
          </div>
          <div className="flex flex-col items-start justify-between gap-6 md:col-span-3 md:items-end">
            <Btn onClick={() => open(p)} variant="solid">
              Ver case
            </Btn>
            <div className="flex items-center gap-4">
              <span className="label tabular-nums text-silver-2">
                <span className="text-paper">{idx(active)}</span> / {idx(projects.length - 1)}
              </span>
              <button onClick={() => move(-1)} aria-label="Projeto anterior" data-cursor="link" className="grid h-12 w-12 place-items-center rounded-full border border-white/15 transition-colors duration-500 hover:border-acc hover:bg-acc hover:text-ink">
                <Arrow dir="w" className="h-4 w-4" />
              </button>
              <button onClick={() => move(1)} aria-label="Próximo projeto" data-cursor="link" className="grid h-12 w-12 place-items-center rounded-full border border-white/15 transition-colors duration-500 hover:border-acc hover:bg-acc hover:text-ink">
                <Arrow dir="e" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* faixa de miniaturas: todas as prévias à vista */}
        <ol data-thumbs className="-mx-[var(--gutter)] mt-10 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-12 md:overflow-visible md:px-0" aria-label="Todos os projetos">
          {projects.map((x, i) => (
            <li key={x.slug} data-thumb className="w-[112px] shrink-0 md:w-auto">
              <button onClick={() => jump(i)} data-cursor="link" aria-label={`${x.title}, ${x.category}`} aria-current={i === active} className="group block w-full text-left">
                <span className={clsx("relative block overflow-hidden rounded-[8px] border transition-colors duration-500", i === active ? "border-paper/70" : "border-white/10")}>
                  <img src={x.thumb} alt="" loading="lazy" decoding="async" className={clsx("aspect-[16/10] w-full object-cover transition-all duration-700 ease-expo", i === active ? "opacity-100" : "opacity-45 group-hover:opacity-80")} />
                  {/* tempo do avanço automático */}
                  {i === active && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
                      <span
                        key={`${active}-${paused}-${inView}`}
                        className="block h-full origin-left bg-acc"
                        style={{ animation: inView && !paused ? `storybar ${AUTOPLAY}ms linear forwards` : undefined, transform: "scaleX(0)" }}
                      />
                    </span>
                  )}
                </span>
                <span className={clsx("label mt-2 flex gap-2 truncate transition-colors duration-500", i === active ? "text-paper" : "text-steel")}>
                  <span>{idx(i)}</span>
                  <span className="truncate normal-case tracking-normal">{x.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Título do projeto em foco: as letras sobem a cada troca. */
function ActiveTitle({ title }: { title: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const s = SplitText.create(ref.current, { type: "words,chars", mask: "chars", charsClass: "split-char" });
    const tw = gsap.from(s.chars, { yPercent: 110, duration: 0.9, stagger: 0.018, ease: "out" });
    return () => {
      tw.kill();
      s.revert();
    };
  }, []);
  return (
    <h3 ref={ref} className="mt-4 text-[clamp(36px,3.7vw,66px)] font-[580] leading-[0.95] tracking-[-0.045em]">
      {title}
    </h3>
  );
}

/** Troca suave do bloco de texto. */
function SwapText({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    // contexto revertido na limpeza: seguro com o StrictMode montando duas vezes
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.children, { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "out", delay: 0.1 });
    });
    return () => ctx.revert();
  }, []);
  return <div ref={ref}>{children}</div>;
}

/** Sem WebGL: capas em sequência com troca por opacidade. */
function FallbackSlides({ active, onOpen }: { active: number; onOpen: (p: Project) => void }) {
  return (
    <div className="wrap relative h-full">
      {projects.map((x, i) => (
        <button
          key={x.slug}
          onClick={() => onOpen(x)}
          className={clsx("absolute inset-x-[var(--gutter)] inset-y-0 overflow-hidden rounded-[16px] transition-opacity duration-700", i === active ? "opacity-100" : "pointer-events-none opacity-0")}
          aria-hidden={i !== active}
        >
          <img src={x.cover} alt={x.title} loading="lazy" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}
