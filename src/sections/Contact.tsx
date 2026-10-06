import { useRef, useState } from "react";
import { contact, profile, socials } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { revealChars, revealLines } from "@/lib/reveal";
import { reducedMotion } from "@/lib/env";
import { stage } from "@/gl/stage";
import { ContactRings } from "@/gl/contactRings";
import { Btn, SectionLabel, Arrow } from "@/components/ui";

/** Contato: título gigante com os anéis borromeanos (mesmo símbolo do hero), e-mail com cópia rápida. */
export function Contact() {
  const glRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const root = useGsap<HTMLElement>((el) => {
    el.querySelectorAll("[data-chars]").forEach((t, i) => revealChars(t, { delay: i * 0.12, stagger: 0.025 }));
    el.querySelectorAll("[data-lines]").forEach((t) => revealLines(t));

    const scene = new ContactRings(() => glRef.current);
    const off = stage.add(scene);
    const st = ScrollTrigger.create({
      trigger: glRef.current,
      start: "top 85%",
      once: true,
      onEnter: () => void gsap.to(scene, { appear: 1, duration: reducedMotion() ? 0.01 : 2, ease: "expo.out" }),
    });

    // arrastar sobre os anéis gira o conjunto
    const inside = (e: PointerEvent) => {
      const r = glRef.current?.getBoundingClientRect();
      return !!r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    };
    const down = (e: PointerEvent) => inside(e) && scene.pointerDown(e.clientX, e.clientY);
    const move = (e: PointerEvent) => scene.pointerMove(e.clientX, e.clientY);
    const up = () => scene.pointerUp();
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);

    return () => {
      st.kill();
      off();
      scene.dispose();
      gsap.killTweensOf(scene);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const mail = `mailto:${profile.email}?subject=${encodeURIComponent(contact.mailSubject)}`;

  return (
    <section ref={root} id="contato" data-theme="dark" className="relative overflow-hidden pb-[10vh] pt-[16vh]">
      <div className="wrap">
        <SectionLabel n="06" className="text-silver-2">
          {contact.kicker}
        </SectionLabel>

        <div className="relative mt-10 grid items-center md:grid-cols-12">
          <div ref={glRef} aria-hidden className="pointer-events-none relative mx-auto -mb-4 aspect-square w-[70vw] md:absolute md:right-[-4vw] md:top-1/2 md:mb-0 md:w-[36vw] md:-translate-y-1/2" />
          <h2 className="relative z-10 text-[clamp(56px,10.5vw,200px)] font-[620] leading-[0.86] tracking-[-0.06em] md:col-span-9">
            <span data-chars className="block">
              {contact.title[0]}
            </span>
            <span data-chars className="block text-silver-2">
              {contact.title[1]}
            </span>
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p data-lines className="lead max-w-[34ch] text-silver">
              {contact.text}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Btn href={mail} variant="acc" size="lg">
                {contact.cta}
              </Btn>
              <Btn href={profile.whatsapp} external variant="ghost" size="lg">
                WhatsApp
              </Btn>
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <p className="label text-steel">E-mail</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <a href={mail} data-cursor="link" className="group relative text-[clamp(22px,2.9vw,46px)] font-[540] tracking-[-0.035em]">
                {profile.email}
                <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 bg-acc transition-transform duration-700 ease-expo group-hover:origin-left group-hover:scale-x-100" />
              </a>
              <button
                onClick={copy}
                data-cursor="link"
                aria-label={copied ? "E-mail copiado" : "Copiar e-mail"}
                title={copied ? "Copiado!" : "Copiar e-mail"}
                className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 text-silver-2 transition-colors duration-500 hover:border-paper hover:text-paper"
              >
                <svg viewBox="0 0 24 24" fill="none" className={"absolute h-[18px] w-[18px] transition-all duration-500 ease-expo " + (copied ? "scale-50 opacity-0" : "scale-100 opacity-100")} aria-hidden>
                  <rect x="8.5" y="8.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <svg viewBox="0 0 24 24" fill="none" className={"absolute h-[18px] w-[18px] text-acc transition-all duration-500 ease-expo " + (copied ? "scale-100 opacity-100" : "scale-50 opacity-0")} aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="sr-only" aria-live="polite">
                  {copied ? "E-mail copiado" : ""}
                </span>
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 border-t border-white/10 sm:grid-cols-3">
              {[{ label: "Telefone", handle: profile.phone, href: profile.phoneHref }, ...socials.filter((s) => s.label !== "WhatsApp")].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  data-cursor="link"
                  className="group flex items-center justify-between gap-3 border-b border-white/10 py-5 sm:border-b-0 sm:pr-4"
                >
                  <span>
                    <span className="label block text-steel">{s.label}</span>
                    <span className="mt-1 block text-[15px] text-silver transition-colors group-hover:text-paper">{s.handle}</span>
                  </span>
                  <Arrow className="h-3.5 w-3.5 text-steel transition-all duration-500 ease-expo group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acc" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
