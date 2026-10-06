import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { isTouch } from "@/lib/env";

/**
 * Cursor próprio: ponto + anel com atraso. Lê `data-cursor` do alvo:
 *  link → anel cresce | view/drag/open → disco com texto | hide → some.
 * `data-cursor-label` troca o texto do disco. A cor segue o tema da seção (sem inverter cores).
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isTouch()) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!;
    const r = ring.current!;
    const l = label.current!;
    gsap.set([d, r], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });

    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });

    let state = "";
    let theme = "dark";
    let shown = false;

    const setState = (s: string, text = "") => {
      if (s === state && l.textContent === text) return;
      state = s;
      const big = s === "view" || s === "drag" || s === "open";
      l.textContent = text;
      gsap.to(r, {
        width: big ? 96 : s === "link" ? 54 : 34,
        height: big ? 96 : s === "link" ? 54 : 34,
        backgroundColor: big ? "var(--cur-fill)" : "rgba(0,0,0,0)",
        borderColor: big ? "rgba(0,0,0,0)" : "var(--cur-line)",
        opacity: s === "hide" ? 0 : 1,
        duration: 0.5,
        ease: "out",
      });
      gsap.to(l, { opacity: big ? 1 : 0, scale: big ? 1 : 0.6, duration: 0.4, ease: "out" });
      gsap.to(d, { scale: big || s === "hide" ? 0 : s === "link" ? 0.4 : 1, duration: 0.35, ease: "out" });
    };

    const setTheme = (t: string) => {
      if (t === theme) return;
      theme = t;
      const root = document.documentElement.style;
      if (t === "light") {
        root.setProperty("--cur-dot", "#0a0a0b");
        root.setProperty("--cur-line", "rgba(10,10,11,0.35)");
        root.setProperty("--cur-fill", "#0a0a0b");
        root.setProperty("--cur-text", "#efefec");
      } else {
        root.setProperty("--cur-dot", "#efefec");
        root.setProperty("--cur-line", "rgba(239,239,236,0.35)");
        root.setProperty("--cur-fill", "#efefec");
        root.setProperty("--cur-text", "#0a0a0b");
      }
    };
    setTheme("light");
    setTheme("dark");

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    let lastTarget: HTMLElement | null = null;
    const over = (e: Event) => {
      const t = e.target as HTMLElement;
      lastTarget = t;
      const c = t.closest<HTMLElement>("[data-cursor]");
      const th = t.closest<HTMLElement>("[data-theme]")?.dataset.theme ?? "dark";
      setTheme(th);
      if (!c) return setState("");
      const s = c.dataset.cursor!;
      const text = c.dataset.cursorLabel ?? (s === "view" ? "Ver case" : s === "drag" ? "Arraste" : s === "open" ? "Abrir" : "");
      setState(s, text);
    };
    const leave = () => {
      shown = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.3 });
    };
    const down = () => gsap.to(r, { scale: 0.82, duration: 0.2 });
    const up = () => gsap.to(r, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.5)" });

    // elementos que mudam o próprio data-cursor (ex.: vitrine) pedem uma releitura
    const refresh = () => lastTarget && over({ target: lastTarget } as unknown as Event);
    window.addEventListener("cursor:refresh", refresh);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("cursor:refresh", refresh);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  if (typeof window !== "undefined" && isTouch()) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95]">
      <div
        ref={ring}
        className="invisible absolute left-0 top-0 grid h-[34px] w-[34px] place-items-center rounded-full border opacity-0"
        style={{ borderColor: "var(--cur-line)" }}
      >
        <span ref={label} className="label whitespace-nowrap text-[10.5px] opacity-0" style={{ color: "var(--cur-text)" }} />
      </div>
      <div ref={dot} className="invisible absolute left-0 top-0 h-[6px] w-[6px] rounded-full opacity-0" style={{ background: "var(--cur-dot)" }} />
    </div>
  );
}
