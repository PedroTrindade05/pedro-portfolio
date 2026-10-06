import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { designProjects, getDesign } from "@/content/design";
import { gsap, SplitText } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { revealLines, revealUp } from "@/lib/reveal";
import { reducedMotion } from "@/lib/env";
import { Btn, SectionLabel } from "@/components/ui";
import { Lightbox, type LightItem } from "@/components/Lightbox";
import { useGo } from "@/components/Transition";
import { Footer } from "@/sections/Footer";

export default function DesignCase() {
  const { slug = "" } = useParams();
  const d = getDesign(slug);
  if (!d) return <Navigate to="/" replace />;
  return <Inner key={d.slug} slug={d.slug} />;
}

function Inner({ slug }: { slug: string }) {
  const d = getDesign(slug)!;
  const i = designProjects.indexOf(d);
  const next = designProjects[(i + 1) % designProjects.length];
  const go = useGo();
  const [light, setLight] = useState<{ items: LightItem[]; i: number } | null>(null);

  useEffect(() => {
    document.title = `${d.title} · Pedro Trindade`;
    return () => {
      document.title = "Pedro Trindade · Front-end, UI/UX e Design";
    };
  }, [d.title]);

  const root = useGsap<HTMLElement>((el) => {
    const title = el.querySelector<HTMLElement>("[data-title]")!;
    const split = SplitText.create(title, { type: "words", mask: "words" });
    if (!reducedMotion()) {
      gsap.from(split.words, { yPercent: 110, duration: 1.3, stagger: 0.06, ease: "out", delay: 0.6 });
      gsap.from(el.querySelectorAll("[data-hero-fade]"), { autoAlpha: 0, y: 20, duration: 1, stagger: 0.06, delay: 0.85 });
      gsap.from(el.querySelector("[data-cover]"), { clipPath: "inset(100% 0 0 0 round 16px)", duration: 1.6, ease: "inOut", delay: 0.5 });
    }
    el.querySelectorAll("[data-lines]").forEach((t) => revealLines(t));
    el.querySelectorAll<HTMLElement>("[data-group]").forEach((g) => revealUp(g.querySelectorAll("[data-piece]"), g, { y: 50, stagger: 0.04 }));
    return () => split.revert();
  }, [slug]);

  return (
    <main ref={root}>
      <section data-theme="dark" className="wrap grid min-h-[100svh] items-end gap-10 pb-[8vh] pt-[calc(var(--header-h)+8vh)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p data-hero-fade className="label mb-6 flex flex-wrap gap-3 text-silver">
            <span className="text-acc">(Design)</span> {d.category} <span className="opacity-40">/</span> {d.year}
          </p>
          <h1 data-title className="text-[clamp(56px,10vw,180px)] font-[620] leading-[0.86] tracking-[-0.06em]">
            {d.title}
          </h1>
          <p data-hero-fade className="mt-6 text-[17px] text-silver-2">{d.client}</p>
          <p data-hero-fade className="lead mt-10 max-w-[40ch] text-silver">
            {d.summary}
          </p>
        </div>
        <div className="lg:col-span-5">
          <div data-cover className="overflow-hidden rounded-[16px] bg-ink-3">
            <img src={d.cover} alt={`Capa de ${d.title}`} className="max-h-[70vh] w-full object-cover object-[50%_20%]" {...{ fetchpriority: "high" }} />
          </div>
        </div>
      </section>

      <section data-theme="dark" className="wrap grid gap-14 border-t border-white/10 py-[12vh] md:grid-cols-12 md:gap-8">
        <aside className="space-y-6 md:col-span-4 lg:col-span-3">
          {[
            ["Cliente", d.client],
            ["Ano", d.year],
            ["Meu papel", d.roles.join(", ")],
            ...(d.tools.length ? [["Ferramentas", d.tools.join(", ")]] : []),
          ].map(([k, v]) => (
            <div key={k} className="border-t border-white/10 pt-4">
              <p className="label text-steel">{k}</p>
              <p className="mt-1.5 text-[16px] font-medium tracking-[-0.01em]">{v}</p>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4">
            <p className="label text-steel">Paleta</p>
            <div className="mt-3 flex gap-2">
              {d.palette.map((c) => (
                <span key={c} className="flex flex-col items-center gap-1.5">
                  <span className="h-9 w-9 rounded-full border border-white/15" style={{ background: c }} />
                  <span className="font-mono text-[9.5px] uppercase text-steel">{c.replace("#", "")}</span>
                </span>
              ))}
            </div>
          </div>
        </aside>
        <div className="md:col-span-8 md:col-start-5">
          <SectionLabel n="01" className="text-silver-2">
            O projeto
          </SectionLabel>
          <p data-lines className="body-lg mt-8 max-w-[64ch] text-[clamp(18px,1.5vw,22px)] text-silver">
            {d.overview}
          </p>
          <ol className="mt-12">
            {d.highlights.map((h, k) => (
              <li key={h} className="grid grid-cols-[48px_1fr] gap-4 border-t border-white/10 py-5 text-[17px] leading-snug md:text-[19px]">
                <span className="label pt-1.5 text-acc">{String(k + 1).padStart(2, "0")}</span>
                <span>{h}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {d.groups.map((g, gi) => {
        const items = g.pieces;
        const feed = items.filter((p) => p.format === "feed");
        const story = items.filter((p) => p.format === "story");
        const page = items.filter((p) => p.format === "page");
        return (
          <section key={g.title} data-group data-theme={gi % 2 === 0 ? "light" : "dark"} className="py-[12vh]">
            <div className="wrap">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionLabel n={String(gi + 2).padStart(2, "0")} className={gi % 2 === 0 ? "text-steel" : "text-silver-2"}>
                  {g.title}
                </SectionLabel>
                <p className={clsx("label", gi % 2 === 0 ? "text-steel" : "text-silver-2")}>{g.note}</p>
              </div>
              {page.length > 0 && (
                <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                  {page.map((p) => (
                    <Piece key={p.src} src={p.sm} caption={p.caption} ratio="aspect-[2000/2982]" onClick={() => setLight({ items: page, i: page.indexOf(p) })} />
                  ))}
                </div>
              )}
              {feed.length > 0 && (
                <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {feed.map((p) => (
                    <Piece key={p.src} src={p.sm} caption={p.caption} ratio="aspect-[4/5]" onClick={() => setLight({ items: feed, i: feed.indexOf(p) })} />
                  ))}
                </div>
              )}
              {story.length > 0 && (
                <div className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6 lg:grid-cols-9">
                  {story.map((p) => (
                    <Piece key={p.src} src={p.sm} caption={p.caption} ratio="aspect-[9/16]" onClick={() => setLight({ items: story, i: story.indexOf(p) })} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      <section data-theme="dark" className="wrap py-[12vh]">
        <a
          href={`/design/${next.slug}`}
          onClick={(e) => {
            e.preventDefault();
            go(`/design/${next.slug}`, { label: next.title });
          }}
          data-cursor="view"
          data-cursor-label="Próximo"
          className="group grid items-end gap-8 border-t border-white/10 pt-10 md:grid-cols-[1fr_auto]"
        >
          <div>
            <p className="label text-silver-2">Próximo projeto de design</p>
            <p className="mt-4 text-[clamp(44px,8vw,140px)] font-[620] leading-[0.9] tracking-[-0.055em] transition-transform duration-700 ease-expo group-hover:translate-x-[1.5vw]">{next.title}</p>
          </div>
          <img src={next.thumb} alt="" loading="lazy" className="aspect-[16/10] w-full rounded-[14px] object-cover md:w-[30vw]" />
        </a>
        <div className="mt-12 flex flex-wrap gap-3">
          <Btn to="/#design" variant="ghost" arrow="e">
            Voltar ao portfólio
          </Btn>
        </div>
      </section>

      <Footer />
      <Lightbox items={light?.items ?? []} index={light?.i ?? null} onChange={(k) => setLight((l) => (l ? { ...l, i: k } : l))} onClose={() => setLight(null)} />
    </main>
  );
}

function Piece({ src, caption, ratio, onClick }: { src: string; caption: string; ratio: string; onClick: () => void }) {
  return (
    <button data-piece onClick={onClick} data-cursor="open" className="group text-left">
      <span className="block overflow-hidden rounded-[8px] bg-ink">
        <img src={src} alt={caption} loading="lazy" decoding="async" className={clsx("w-full object-cover transition-transform duration-[1100ms] ease-expo group-hover:scale-[1.05]", ratio)} />
      </span>
      <span className="label mt-2.5 block truncate opacity-60">{caption}</span>
    </button>
  );
}
