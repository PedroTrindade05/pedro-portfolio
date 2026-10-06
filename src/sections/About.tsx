import { useRef } from "react";
import { about, profile } from "@/content/site";
import { projects } from "@/content/work";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { revealLines, revealUp } from "@/lib/reveal";
import { reducedMotion, isTouch } from "@/lib/env";
import { Btn, SectionLabel } from "@/components/ui";

/**
 * Sobre: manifesto que acende palavra por palavra com a rolagem,
 * foto com revelação em cortina e inclinação 3D, bio e números reais.
 */
export function About() {
  const photo = useRef<HTMLDivElement>(null);

  const root = useGsap<HTMLElement>((el) => {
    const reduce = reducedMotion();
    // foto: cortina + zoom interno + parallax
    const frame = el.querySelector<HTMLElement>("[data-frame]")!;
    const img = frame.querySelector("img")!;
    if (!reduce) {
      gsap.fromTo(frame, { clipPath: "inset(100% 0% 0% 0% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.5, ease: "inOut", scrollTrigger: { trigger: frame, start: "top 85%", once: true } });
      gsap.fromTo(img, { scale: 1.35 }, { scale: 1.08, duration: 1.8, ease: "out", scrollTrigger: { trigger: frame, start: "top 85%", once: true } });
      gsap.to(img, { yPercent: -6, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
    }

    el.querySelectorAll("[data-lines]").forEach((p, i) => revealLines(p, { delay: i * 0.05 }));
    revealUp(el.querySelectorAll("[data-fact]"), el.querySelector("[data-facts]")!, { y: 24, stagger: 0.06 });

    // números contando
    el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
      const to = Number(n.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: n, start: "top 90%", once: true },
        onUpdate: () => (n.textContent = String(Math.round(o.v)).padStart(2, "0")),
      });
    });

  });

  // inclinação 3D da foto seguindo o cursor
  const onMove = (e: React.PointerEvent) => {
    if (isTouch() || !photo.current) return;
    const b = photo.current.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5;
    const y = (e.clientY - b.top) / b.height - 0.5;
    gsap.to(photo.current, { rotateY: x * 9, rotateX: -y * 9, duration: 0.8, ease: "out" });
    gsap.to(photo.current.querySelector("[data-sheen]"), { xPercent: x * 60, yPercent: y * 60, opacity: 1, duration: 0.8 });
  };
  const onLeave = () => {
    if (!photo.current) return;
    gsap.to(photo.current, { rotateY: 0, rotateX: 0, duration: 1.2, ease: "elastic.out(1,0.5)" });
    gsap.to(photo.current.querySelector("[data-sheen]"), { opacity: 0, duration: 0.6 });
  };

  const sectors = new Set(projects.map((p) => p.sector)).size;
  const stats = [
    { n: projects.length, label: "projetos na vitrine" },
    { n: 3, label: "disciplinas, do design ao código" },
    { n: sectors, label: "setores: Web3, automotivo, varejo e educação" },
  ];

  return (
    <section ref={root} id="sobre" data-theme="light" className="relative overflow-hidden pb-[14vh] pt-[16vh]">
      <div className="wrap">
        <SectionLabel n="01" className="text-steel">
          {about.kicker}
        </SectionLabel>

        <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-8">
          {/* foto */}
          <div className="md:col-span-5 lg:col-span-4" style={{ perspective: "1200px" }}>
            <div className="md:sticky md:top-[calc(var(--header-h)+24px)]">
            <div ref={photo} onPointerMove={onMove} onPointerLeave={onLeave} className="relative will-change-transform" style={{ transformStyle: "preserve-3d" }}>
              <div data-frame className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-paper-2">
                <img src={profile.photo} alt="Retrato de Pedro Trindade" className="h-full w-full object-cover object-[50%_30%]" loading="lazy" decoding="async" />
                <div data-sheen aria-hidden className="pointer-events-none absolute -inset-1/2 opacity-0 mix-blend-soft-light" style={{ background: "radial-gradient(closest-side, rgba(255,255,255,.55), transparent 70%)" }} />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/55 to-transparent p-4 pt-16 text-paper">
                  <span className="label">{profile.full}</span>
                  <span className="label flex items-center gap-2">
                    <span className="dot-live" /> {profile.availability}
                  </span>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* texto */}
          <div className="md:col-span-7 md:pl-[4vw] lg:col-span-7 lg:col-start-6">
            <h3 data-lines className="h3">
              {about.hello}
            </h3>
            <div className="mt-8 max-w-[62ch] space-y-5 text-[#3a3b3f]">
              {about.paragraphs.map((p, i) => (
                <p key={i} data-lines className="body-lg">
                  {p}
                </p>
              ))}
            </div>

            <dl data-facts className="mt-12 grid grid-cols-2 border-t border-ink/10">
              {about.facts.map((f, i) => (
                <div key={f.k} data-fact className={`border-b border-ink/10 py-4 ${i % 2 === 0 ? "pr-4" : "border-l pl-4"}`}>
                  <dt className="label text-steel">{f.k}</dt>
                  <dd className="mt-1.5 text-[15px] font-medium tracking-[-0.01em] md:text-[16px]">{f.v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[clamp(44px,5vw,84px)] font-[560] leading-none tracking-[-0.05em] tabular-nums">
                    <span data-count={s.n}>00</span>
                  </p>
                  <p className="mt-2 max-w-[22ch] text-[13px] leading-snug text-steel">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap gap-3">
              <Btn to="/#trabalhos" variant="solid">
                Ver trabalhos
              </Btn>
              <Btn href={profile.whatsapp} external variant="ghost">
                Chamar no WhatsApp
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
