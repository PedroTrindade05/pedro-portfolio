import { skills, tools } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { revealLines } from "@/lib/reveal";
import { isTouch, reducedMotion } from "@/lib/env";
import { SectionLabel } from "@/components/ui";
import { DisciplineIcon } from "@/components/Icons";

const SEGMENTS = 20;

/**
 * Habilidades em três colunas com medidores segmentados que acendem um a um,
 * seguidas das ferramentas por categoria em peças que giram em 3D ao entrar.
 */
export function Skills() {
  const root = useGsap<HTMLElement>((el) => {
    const reduce = reducedMotion();
    el.querySelectorAll("[data-lines]").forEach((t) => revealLines(t));
    if (reduce) return;

    el.querySelectorAll<HTMLElement>("[data-group]").forEach((g) => {
      gsap.from(g, { y: 60, autoAlpha: 0, duration: 1.2, ease: "out", scrollTrigger: { trigger: g, start: "top 88%", once: true } });
      const segs = g.querySelectorAll("[data-on]");
      gsap.from(segs, { scaleY: 0.15, opacity: 0.1, duration: 0.5, stagger: 0.012, ease: "power2.out", scrollTrigger: { trigger: g, start: "top 75%", once: true } });
    });

    el.querySelectorAll<HTMLElement>("[data-toolrow]").forEach((row) => {
      gsap.from(row.querySelectorAll("[data-tool]"), {
        rotateX: -90,
        y: 30,
        autoAlpha: 0,
        transformOrigin: "50% 0%",
        duration: 1,
        stagger: 0.06,
        ease: "out",
        scrollTrigger: { trigger: row, start: "top 88%", once: true },
      });
    });
  });

  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (isTouch()) return;
    const el = e.currentTarget;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5;
    const y = (e.clientY - b.top) / b.height - 0.5;
    gsap.to(el, { rotateY: x * 16, rotateX: -y * 16, duration: 0.6, ease: "out" });
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const untilt = (e: React.PointerEvent<HTMLElement>) => gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 1, ease: "elastic.out(1,0.5)" });

  return (
    <section ref={root} id="habilidades" data-theme="dark" className="relative py-[16vh]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionLabel n="04" className="text-silver-2">
              Habilidades
            </SectionLabel>
            <h2 data-lines className="h1 mt-8 max-w-[12ch]">
              Design e código
            </h2>
          </div>
          <p data-lines className="max-w-[40ch] text-[16px] leading-relaxed text-silver-2">
            {skills.lead}
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {skills.groups.map((g) => (
            <article key={g.id} data-group className="relative overflow-hidden rounded-[18px] border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.01] p-6 md:p-7">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-ink text-paper">
                  <DisciplineIcon name={g.icon} className="h-6 w-6" />
                </span>
                <span className="label text-steel">({g.id})</span>
              </div>
              <p className="label mt-8 text-silver-2">{g.kicker}</p>
              <h3 className="mt-2 text-[30px] font-[580] leading-none tracking-[-0.04em]">{g.title}</h3>

              <ul className="mt-8 space-y-5">
                {g.skills.map((s) => {
                  const on = Math.round((s.level / 100) * SEGMENTS);
                  return (
                    <li key={s.name}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[16px] font-medium tracking-[-0.01em]">{s.name}</span>
                        <span className="label tabular-nums text-steel">{s.level}%</span>
                      </div>
                      <p className="mt-0.5 text-[13px] text-silver-2">{s.note}</p>
                      <div className="mt-2.5 flex h-[10px] gap-[3px]" aria-hidden>
                        {Array.from({ length: SEGMENTS }, (_, i) => (
                          <span
                            key={i}
                            {...(i < on ? { "data-on": "" } : {})}
                            className={`flex-1 origin-bottom rounded-[1.5px] ${i < on ? (i === on - 1 ? "bg-acc" : "bg-gradient-to-b from-paper to-silver-2") : "bg-white/[0.07]"}`}
                          />
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>

        {/* FERRAMENTAS */}
        <div id="ferramentas" className="mt-[16vh]">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="label text-silver-2">Stack & ferramentas</p>
              <h3 data-lines className="h2 mt-6 max-w-[14ch]">
                Caixa de ferramentas
              </h3>
            </div>
            <p data-lines className="max-w-[38ch] text-[16px] leading-relaxed text-silver-2">
              {tools.lead}
            </p>
          </div>

          <div className="mt-12 border-t border-white/10">
            {tools.cats.map((c) => {
              const items = tools.items.filter((t) => t.cat === c.id);
              return (
                <div key={c.id} data-toolrow className="grid gap-6 border-b border-white/10 py-8 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <p className="text-[18px] font-medium tracking-[-0.02em]">{c.label}</p>
                    <p className="mt-1 text-[14px] text-steel">{c.note}</p>
                  </div>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:col-span-9 lg:grid-cols-6" style={{ perspective: "900px" }}>
                    {items.map((t) => (
                      <li
                        key={t.name}
                        data-tool
                        onPointerMove={tilt}
                        onPointerLeave={untilt}
                        className="group relative overflow-hidden rounded-[14px] border border-white/10 bg-ink-2 p-4 transition-colors duration-500 hover:border-white/25"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{ background: "radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.10), transparent 60%)" }}
                        />
                        <img src={t.img} alt="" loading="lazy" decoding="async" className="h-9 w-9 object-contain" style={{ transform: "translateZ(24px)" }} />
                        <p className="mt-6 text-[15px] font-medium tracking-[-0.01em]">{t.name}</p>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-steel">{t.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
