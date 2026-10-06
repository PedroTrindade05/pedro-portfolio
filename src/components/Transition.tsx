import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis, lockScroll, scrollToTarget } from "@/lib/scroll";
import { reducedMotion } from "@/lib/env";
import { bus } from "@/lib/bus";

type GoOpts = { label?: string };
type Go = (to: string, opts?: GoOpts) => void;

const Ctx = createContext<Go>(() => {});
export const useGo = () => useContext(Ctx);

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/**
 * Transição entre páginas: uma cortina grafite sobe com o nome do destino,
 * a rota troca por baixo e a cortina continua subindo para revelar a nova página.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const panel = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLParagraphElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    gsap.set(panel.current, { yPercent: 100, y: 0 });
  }, []);

  const go = useCallback<Go>(
    async (to, opts = {}) => {
      if (busy.current) return;
      const [path, hash] = to.split("#");
      const target = path || location.pathname;

      // mesma página: só rola
      if (target === location.pathname) {
        if (hash) scrollToTarget(`#${hash}`);
        else scrollToTarget(0);
        return;
      }

      busy.current = true;
      const el = panel.current!;
      const t = title.current!;
      t.textContent = opts.label ?? "";
      lockScroll(true);
      bus.emit("transition:out");

      if (!reducedMotion()) {
        gsap.set(el, { yPercent: 100, y: 0, display: "flex" });
        gsap.set(el.querySelector("[data-edge]"), { scaleY: 1 });
        gsap.set(t, { yPercent: 110 });
        await gsap
          .timeline()
          .to(el, { yPercent: 0, duration: 0.85, ease: "inOut" })
          .to(t, { yPercent: 0, duration: 0.7, ease: "out" }, 0.45)
          .then();
      }

      navigate(target);
      await nextFrame();
      getLenis()?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
      if (hash) {
        await nextFrame();
        scrollToTarget(`#${hash}`, { immediate: true });
      }
      lockScroll(false);
      bus.emit("transition:in");

      if (!reducedMotion()) {
        await gsap
          .timeline()
          .to(t, { yPercent: -110, duration: 0.5, ease: "power2.in" })
          .to(el, { yPercent: -100, duration: 0.95, ease: "inOut" }, 0.2)
          .then();
      }
      gsap.set(el, { display: "none" });
      busy.current = false;
    },
    [location.pathname, navigate],
  );

  return (
    <Ctx.Provider value={go}>
      {children}
      <div
        ref={panel}
        data-curtain
        aria-hidden
        className="fixed inset-0 z-[90] hidden items-end justify-start overflow-hidden bg-ink-2 text-paper"
      >
        <span data-edge className="absolute inset-x-0 top-0 h-px bg-acc" />
        <div className="wrap w-full pb-[8vh]">
          <p className="label mb-4 text-silver-2">Pedro Trindade · Portfólio</p>
          <div className="overflow-hidden">
            <p ref={title} className="h1 text-chrome" />
          </div>
        </div>
      </div>
    </Ctx.Provider>
  );
}
