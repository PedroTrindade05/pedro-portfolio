import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import { nav, profile, socials } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lockScroll, scrollState } from "@/lib/scroll";
import { Btn, Roll } from "./ui";
import { useGo } from "./Transition";
import { Clock } from "./Clock";
import { Monogram } from "./Monogram";

/**
 * Cabeçalho fixo: troca de cor conforme a seção por baixo (clara/escura),
 * some ao rolar para baixo e volta ao subir. No celular abre um menu de tela cheia.
 */
export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const location = useLocation();
  const go = useGo();

  // tema conforme a seção sob o cabeçalho + seção ativa
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    const setup = () => {
      triggers.forEach((t) => t.kill());
      triggers.length = 0;
      document.querySelectorAll<HTMLElement>("main [data-theme]").forEach((sec) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: sec,
            start: "top 40px",
            end: "bottom 40px",
            onToggle: (s) => s.isActive && setLight(sec.dataset.theme === "light"),
          }),
        );
      });
      nav.forEach((n) => {
        const sec = document.querySelector(n.href);
        if (!sec) return;
        triggers.push(
          ScrollTrigger.create({
            trigger: sec,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (s) => s.isActive && setActive(n.href),
            onLeaveBack: () => n.id === "01" && setActive(""),
          }),
        );
      });
    };
    const id = setTimeout(setup, 60);
    return () => {
      clearTimeout(id);
      triggers.forEach((t) => t.kill());
    };
  }, [location.pathname]);

  // esconde ao descer, mostra ao subir
  useEffect(() => {
    const el = ref.current!;
    let hidden = false;
    const tick = () => {
      const shouldHide = scrollState.y > 260 && scrollState.direction > 0 && Math.abs(scrollState.velocity) > 0.5 && !open;
      const shouldShow = scrollState.direction < 0 || scrollState.y < 260;
      if (shouldHide && !hidden) {
        hidden = true;
        gsap.to(el, { yPercent: -110, duration: 0.6, ease: "inOut" });
      } else if (shouldShow && hidden) {
        hidden = false;
        gsap.to(el, { yPercent: 0, duration: 0.7, ease: "out" });
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [open]);

  useEffect(() => {
    lockScroll(open);
  }, [open]);

  const onHome = location.pathname === "/";
  const link = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    go(onHome ? href : `/${href}`);
  };

  return (
    <>
      <header
        ref={ref}
        className={clsx(
          "wrap fixed inset-x-0 top-0 z-50 flex h-[var(--header-h)] items-center justify-between transition-colors duration-500",
          light && !open ? "text-ink" : "text-paper",
        )}
        style={{ ["--fg" as string]: light && !open ? "#0a0a0b" : "#efefec", ["--bg" as string]: light && !open ? "#efefec" : "#0a0a0b" }}
      >
        <a href="/" onClick={(e) => (e.preventDefault(), setOpen(false), go("/", { label: "Início" }))} className="group flex items-center gap-3" data-cursor="link" aria-label="Pedro Trindade, início">
          <Monogram className="h-9 w-9" />
          <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:block">
            <Roll>{profile.full}</Roll>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Seções">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={link(n.href)} className="group flex items-center gap-2 text-[14px] font-medium" data-cursor="link">
              <span className={clsx("h-1.5 w-1.5 rounded-full bg-acc transition-transform duration-500 ease-expo", active === n.href ? "scale-100" : "scale-0")} />
              <span className="label opacity-45">{n.id}</span>
              <Roll>{n.label}</Roll>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Btn href={`mailto:${profile.email}`} variant="solid">
              Vamos conversar
            </Btn>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            className="group flex h-12 items-center gap-3 rounded-full border px-5 text-[14px] font-medium lg:hidden"
            style={{ borderColor: "color-mix(in srgb, currentColor 22%, transparent)" }}
            aria-expanded={open}
            aria-controls="menu"
            data-cursor="link"
          >
            {open ? "Fechar" : "Menu"}
            <span className="relative block h-2.5 w-4">
              <span className={clsx("absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-expo", open && "translate-y-[5px] rotate-45")} />
              <span className={clsx("absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ease-expo", open && "-translate-y-[4px] -rotate-45")} />
            </span>
          </button>
        </div>
      </header>

      <Menu open={open} onLink={link} />
    </>
  );
}

function Menu({ open, onLink }: { open: boolean; onLink: (href: string) => (e: React.MouseEvent) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    const el = ref.current!;
    if (first.current) {
      first.current = false;
      gsap.set(el, { clipPath: "inset(0 0 100% 0)", display: "none" });
      return;
    }
    const items = el.querySelectorAll("[data-item]");
    if (open) {
      gsap.set(el, { display: "flex" });
      gsap.to(el, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "inOut" });
      gsap.fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.05, ease: "out", delay: 0.3 });
    } else {
      gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "inOut", onComplete: () => void gsap.set(el, { display: "none" }) });
    }
  }, [open]);

  return (
    <div ref={ref} id="menu" data-theme="dark" className="wrap fixed inset-0 z-40 hidden flex-col justify-between bg-ink-2 pb-8 pt-[calc(var(--header-h)+5vh)]" aria-hidden={!open}>
      <ul className="space-y-1">
        {nav.map((n) => (
          <li key={n.href} className="overflow-hidden">
            <a data-item href={n.href} onClick={onLink(n.href)} className="flex items-baseline gap-4 py-1">
              <span className="label text-steel">{n.id}</span>
              <span className="text-[clamp(40px,11vw,84px)] font-semibold leading-[0.95] tracking-[-0.045em]">{n.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="grid gap-6 text-silver-2 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="label text-steel">Contato</p>
          <a href={`mailto:${profile.email}`} className="block text-[17px] text-paper">
            {profile.email}
          </a>
          <a href={profile.phoneHref} className="block text-[17px] text-paper">
            {profile.phone}
          </a>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="flex gap-4">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="label text-paper">
                {s.label}
              </a>
            ))}
          </div>
          <span className="label">
            <Clock />
          </span>
        </div>
      </div>
    </div>
  );
}
