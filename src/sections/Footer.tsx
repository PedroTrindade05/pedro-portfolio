import { useRef } from "react";
import { profile, socials } from "@/content/site";
import { useGsap } from "@/lib/hooks";
import { fitText } from "@/lib/fit";
import { gsap } from "@/lib/gsap";
import { reducedMotion } from "@/lib/env";
import { scrollToTarget } from "@/lib/scroll";
import { portalTo } from "@/lib/portal";
import { Clock } from "@/components/Clock";
import { TextLink, Arrow } from "@/components/ui";

/** Rodapé com assinatura gigante em metal escovado, que sobe da borda ao chegar no fim. */
export function Footer() {
  const word = useRef<HTMLParagraphElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const root = useGsap<HTMLElement>((el) => {
    const off = fitText(word.current!, inner.current!, () => {
      const cs = getComputedStyle(word.current!);
      return word.current!.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    });
    if (!reducedMotion()) {
      gsap.fromTo(inner.current, { yPercent: 60 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
    }
    return off;
  });

  return (
    <footer ref={root} data-theme="dark" className="relative overflow-hidden border-t border-white/10 pt-14">
      <div className="wrap grid gap-10 text-[15px] md:grid-cols-4">
        <div className="space-y-1.5">
          <p className="label text-steel">Contato</p>
          <TextLink href={`mailto:${profile.email}`}>{profile.email}</TextLink>
          <br />
          <TextLink href={profile.phoneHref}>{profile.phone}</TextLink>
        </div>
        <div className="space-y-1.5">
          <p className="label text-steel">Redes</p>
          {socials.map((s) => (
            <div key={s.label}>
              <TextLink href={s.href} external>
                {s.label}
              </TextLink>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="label text-steel">Local</p>
          <p>{profile.location}</p>
          <p className="text-silver-2">
            <Clock />
          </p>
        </div>
        <div className="flex items-start md:justify-end">
          <button onClick={(e) => portalTo(0, { x: e.clientX, y: e.clientY }) || scrollToTarget(0, { duration: 2 })} className="group flex items-center gap-3 label" data-cursor="link">
            Voltar ao topo
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition-colors duration-500 group-hover:border-acc group-hover:bg-acc group-hover:text-ink">
              <Arrow dir="n" className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>

      <p ref={word} className="display wrap mt-16 leading-[0.78]" aria-hidden>
        <span
          ref={inner}
          className="inline-block whitespace-nowrap pb-[0.06em] will-change-transform"
          style={{
            background: "linear-gradient(100deg,#5e6269 0%,#f5f6f8 20%,#a7acb4 36%,#eceef1 52%,#7d828a 68%,#fafbfc 84%,#8d9299 100%)",
            backgroundSize: "220% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {profile.full}
        </span>
      </p>

      <div className="wrap flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-steel">
        <p className="label">© {new Date().getFullYear()} {profile.full}</p>
        <p className="label">Design e código por mim · React, Three.js e GSAP</p>
      </div>
    </footer>
  );
}
