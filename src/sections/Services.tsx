import { useRef, useState } from "react";
import clsx from "clsx";
import { services } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { revealLines, revealUp } from "@/lib/reveal";
import { isMobile, reducedMotion } from "@/lib/env";
import { stage } from "@/gl/stage";
import { ChromeLayer } from "@/gl/chrome";
import { SectionLabel } from "@/components/ui";

/**
 * Serviços: à esquerda, um objeto de metal fixo que se transforma conforme o serviço ativo
 * ( </> código · cursor de interface · caneta bézier de design ). À direita, os três serviços.
 */
export function Services() {
  const glRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const root = useGsap<HTMLElement>((el) => {
    const reduce = reducedMotion();
    el.querySelectorAll("[data-lines]").forEach((t) => revealLines(t));

    const layer = new ChromeLayer({ anchor: () => glRef.current, mode: "glyph", order: 2, light: 1 });
    layer.size = 0.62;
    layer.weights.set(1, 0, 0);
    const off = stage.add(layer);
    const appear = ScrollTrigger.create({
      trigger: el,
      start: "top 75%",
      once: true,
      onEnter: () => gsap.to(layer, { appear: 1, duration: reduce ? 0.01 : 1.8, ease: "expo.out" }),
    });

    let current = 0;
    const morph = (i: number) => {
      if (i === current) return;
      current = i;
      setActive(i);
      const target = [0, 0, 0];
      target[i] = 1;
      const w = { x: layer.weights.x, y: layer.weights.y, z: layer.weights.z };
      gsap.killTweensOf(w);
      gsap.to(w, {
        x: target[0],
        y: target[1],
        z: target[2],
        duration: reduce ? 0.01 : 1.1,
        ease: "power3.inOut",
        onUpdate: () => {
          layer.weights.set(w.x, w.y, w.z);
        },
      });
      if (!reduce) {
        gsap.fromTo(layer, { wobble: 1 }, { wobble: 0, duration: 1.4, ease: "power2.out" });
      }
    };

    const items = el.querySelectorAll<HTMLElement>("[data-service]");
    let triggers: ScrollTrigger[] = [];
    let cycle: number | undefined;
    if (isMobile()) {
      // no celular o objeto fica no topo e alterna sozinho enquanto está visível
      triggers = [
        ScrollTrigger.create({
          trigger: glRef.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (s) => {
            clearInterval(cycle);
            if (s.isActive) cycle = window.setInterval(() => morph((current + 1) % 3), 2600);
          },
        }),
      ];
    } else {
      triggers = Array.from(items).map((item, i) =>
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (s) => s.isActive && morph(i),
        }),
      );
    }
    items.forEach((item) => revealUp(item.querySelectorAll("[data-tag]"), item, { y: 14, stagger: 0.04, start: "top 70%" }));

    return () => {
      clearInterval(cycle);
      appear.kill();
      triggers.forEach((t) => t.kill());
      off();
      layer.dispose();
    };
  });

  return (
    <section ref={root} id="servicos" data-theme="light" className="relative pb-[10vh] pt-[16vh]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionLabel n="03" className="text-steel">
              Serviços
            </SectionLabel>
            <h2 data-lines className="h1 mt-8 max-w-[13ch]">
              Do primeiro traço ao deploy
            </h2>
          </div>
        </div>

        <div className="mt-[10vh] grid gap-10 md:grid-cols-12">
          {/* objeto 3D fixo */}
          <div className="md:col-span-5">
            <div className="sticky top-[calc(var(--header-h)+4vh)] md:top-[18vh]">
              <div ref={glRef} aria-hidden className={clsx("relative mx-auto aspect-square w-full max-w-[520px]", isMobile() && "max-w-[300px]")}>
                <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,rgba(10,10,11,0.07),transparent)]" />
              </div>
              <div className="mx-auto mt-2 flex max-w-[520px] items-center justify-between">
                {services.map((s, i) => (
                  <span key={s.id} className={clsx("label transition-colors duration-500", active === i ? "text-ink" : "text-ink/30")}>
                    {s.id} {s.short}
                  </span>
                ))}
              </div>
              <div className="relative mx-auto mt-3 h-px max-w-[520px] bg-ink/10">
                <span className="absolute inset-y-0 left-0 w-1/3 bg-ink transition-transform duration-700 ease-expo" style={{ transform: `translateX(${active * 100}%)` }} />
              </div>
            </div>
          </div>

          {/* lista de serviços */}
          <div className="md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
            {services.map((s, i) => (
              <article
                key={s.id}
                data-service
                className={clsx("flex min-h-[62vh] flex-col justify-center border-t border-ink/10 py-14 transition-opacity duration-700", active === i ? "opacity-100" : "md:opacity-35")}
              >
                <p className="label text-steel">
                  ({s.id}) {s.short}
                </p>
                <h3 className="mt-5 text-[clamp(34px,3.7vw,64px)] font-[580] leading-[0.95] tracking-[-0.045em]">{s.title.replace("-", "‑")}</h3>
                <p className="body-lg mt-6 max-w-[48ch] text-[#3a3b3f]">{s.text}</p>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {s.deliver.map((d) => (
                    <li key={d} data-tag className="chip text-ink/70">
                      <span className="h-1 w-1 rounded-full bg-ink/40" />
                      {d}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
