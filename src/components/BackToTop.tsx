import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { portalTo } from "@/lib/portal";
import { scrollToTarget } from "@/lib/scroll";
import { Arrow } from "./ui";

const R = 22;
const C = 2 * Math.PI * R;

/**
 * Botão flutuante de voltar ao topo (canto inferior direito). Aparece depois que o hero sai da tela
 * e some perto do fim da página, onde o rodapé já tem o próprio botão. O anel em volta mostra quanto
 * da página já foi rolado (escrito direto no SVG, sem re-render). O clique usa o mesmo portal do rodapé.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let max = 1;
    let raf = 0;
    let visible = false;
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const paint = () => {
      raf = 0;
      const y = window.scrollY;
      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - Math.min(1, y / max)));
      const next = y > window.innerHeight * 0.6 && y < max - window.innerHeight * 0.45;
      if (next !== visible) {
        visible = next;
        setShow(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    measure();
    paint();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={(e) => portalTo(0, { x: e.clientX, y: e.clientY }) || scrollToTarget(0, { duration: 1.6 })}
      aria-label="Voltar ao topo"
      tabIndex={show ? 0 : -1}
      data-cursor="link"
      className={clsx(
        "group fixed bottom-[max(20px,env(safe-area-inset-bottom))] right-[var(--gutter)] z-[55] grid h-[52px] w-[52px] place-items-center rounded-full bg-ink text-paper shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-all duration-500 ease-expo",
        show ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-75 opacity-0",
      )}
    >
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="26" cy="26" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
        <circle ref={ring} cx="26" cy="26" r={R} fill="none" stroke="var(--acc)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <Arrow dir="n" className="relative h-[18px] w-[18px] transition-transform duration-500 ease-expo group-hover:-translate-y-0.5" />
    </button>
  );
}
