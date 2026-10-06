import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import clsx from "clsx";
import { gsap } from "@/lib/gsap";
import { isTouch } from "@/lib/env";
import { useGo } from "./Transition";

/** Texto que "rola" para cima no hover do elemento pai com a classe `group`. */
export function Roll({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={clsx("relative inline-flex overflow-hidden align-top", className)}>
      <span className="block transition-transform duration-[650ms] ease-expo group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute left-0 top-full block transition-transform duration-[650ms] ease-expo group-hover:-translate-y-full">
        {children}
      </span>
    </span>
  );
}

/** Puxa o elemento na direção do cursor (efeito magnético). */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      xTo((e.clientX - (b.left + b.width / 2)) * strength);
      yTo((e.clientY - (b.top + b.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return ref;
}

export function Arrow({ className = "", dir = "ne" }: { className?: string; dir?: "ne" | "e" | "s" | "w" | "n" }) {
  const rot = { ne: 0, e: 45, s: 135, w: -135, n: -45 }[dir];
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

type BtnProps = {
  children: string;
  href?: string;
  to?: string;
  onClick?: () => void;
  variant?: "solid" | "ghost" | "acc";
  size?: "md" | "lg";
  external?: boolean;
  className?: string;
  arrow?: "ne" | "e" | "s";
};

/** Botão pílula com texto que rola e disco com seta que acende no hover. */
export function Btn({ children, href, to, onClick, variant = "solid", size = "md", external, className, arrow = "ne" }: BtnProps) {
  const mag = useMagnetic<HTMLDivElement>(0.25);
  const go = useGo();
  const base = clsx(
    "group relative inline-flex items-center rounded-full font-medium tracking-[-0.01em] transition-colors duration-500 ease-expo",
    size === "lg" ? "h-[60px] gap-5 pl-7 pr-2 text-[17px]" : "h-[48px] gap-4 pl-5 pr-1.5 text-[15px]",
    variant === "solid" && "bg-[var(--fg,#efefec)] text-[var(--bg,#0a0a0b)]",
    variant === "ghost" && "border border-current/20 [border-color:color-mix(in_srgb,currentColor_22%,transparent)]",
    variant === "acc" && "bg-acc text-ink",
    className,
  );
  const disc = (
    <span
      className={clsx(
        "relative grid place-items-center overflow-hidden rounded-full transition-colors duration-500 ease-expo",
        size === "lg" ? "h-12 w-12" : "h-9 w-9",
        variant === "acc" ? "bg-ink text-acc" : "bg-acc text-ink",
      )}
    >
      <span className="block transition-transform duration-500 ease-expo group-hover:translate-x-6 group-hover:-translate-y-6">
        <Arrow dir={arrow} className="h-4 w-4" />
      </span>
      <span className="absolute block -translate-x-6 translate-y-6 transition-transform duration-500 ease-expo group-hover:translate-x-0 group-hover:translate-y-0">
        <Arrow dir={arrow} className="h-4 w-4" />
      </span>
    </span>
  );
  const inner = (
    <>
      <Roll>{children}</Roll>
      {disc}
    </>
  );
  const handle = (e: MouseEvent) => {
    if (to) {
      e.preventDefault();
      go(to);
    }
    onClick?.();
  };
  return (
    <div ref={mag} className="inline-block">
      {href || to ? (
        <a
          href={href ?? to}
          onClick={handle}
          className={base}
          data-cursor="link"
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {inner}
        </a>
      ) : (
        <button type="button" onClick={handle} className={base} data-cursor="link">
          {inner}
        </button>
      )}
    </div>
  );
}

/** Rótulo de seção: (01) SOBRE */
export function SectionLabel({ n, children, className = "" }: { n: string; children: ReactNode; className?: string }) {
  return (
    <p className={clsx("label flex items-center gap-3", className)}>
      <span className="opacity-50">({n})</span>
      <span className="h-px w-8 bg-current opacity-25" />
      <span>{children}</span>
    </p>
  );
}

/** Link de texto com sublinhado que corre. */
export function TextLink({ href, children, external, className = "" }: { href: string; children: ReactNode; external?: boolean; className?: string }) {
  return (
    <a
      href={href}
      data-cursor="link"
      className={clsx("group relative inline-flex items-center gap-1.5", className)}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-expo group-hover:origin-left group-hover:scale-x-100" />
      </span>
    </a>
  );
}
