import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/gsap";
import { lockScroll } from "@/lib/scroll";
import { Arrow } from "./ui";

export type LightItem = { src: string; caption: string };

/** Visualizador em tela cheia com setas, teclado e arraste. */
export function Lightbox({ items, index, onChange, onClose }: { items: LightItem[]; index: number | null; onChange: (i: number) => void; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const open = index !== null;

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      onChange((index + d + items.length) % items.length);
    },
    [index, items.length, onChange],
  );

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "out" });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      lockScroll(false);
    };
  }, [open, go, onClose]);

  useEffect(() => {
    if (index === null || !img.current) return;
    gsap.fromTo(img.current, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "out" });
  }, [index]);

  // arraste horizontal no toque
  const start = useRef<number | null>(null);

  if (!open) return null;
  const it = items[index!];

  return createPortal(
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={it.caption}
      data-theme="dark"
      className="fixed inset-0 z-[85] flex flex-col bg-ink/95"
      onPointerDown={(e) => (start.current = e.clientX)}
      onPointerUp={(e) => {
        if (start.current === null) return;
        const dx = e.clientX - start.current;
        start.current = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="wrap flex h-[var(--header-h)] items-center justify-between">
        <p className="label text-silver-2">
          {String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} · {it.caption}
        </p>
        <button onClick={onClose} className="chip text-paper" data-cursor="link">
          Fechar · Esc
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-24">
        <img ref={img} src={it.src} alt={it.caption} className="max-h-full max-w-full rounded-[10px] object-contain shadow-2xl" draggable={false} />
        <button onClick={() => go(-1)} aria-label="Anterior" data-cursor="link" className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 text-paper hover:border-acc md:grid">
          <Arrow dir="w" className="h-4 w-4" />
        </button>
        <button onClick={() => go(1)} aria-label="Próxima" data-cursor="link" className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 text-paper hover:border-acc md:grid">
          <Arrow dir="e" className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
