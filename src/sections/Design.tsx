import { useEffect, useMemo, useRef, useState } from "react";
import { useMedia } from "@/lib/hooks";
import clsx from "clsx";
import { designProjects, type Piece } from "@/content/design";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { revealLines } from "@/lib/reveal";
import { reducedMotion } from "@/lib/env";
import { Btn, SectionLabel, Arrow } from "@/components/ui";
import { useGo } from "@/components/Transition";
import { Lightbox } from "@/components/Lightbox";

/**
 * Design gráfico como galeria: todas as peças dos projetos misturadas num mosaico,
 * com filtros por tipo. Clicar numa peça abre em tela cheia (com setas e teclado).
 * Os dois projetos aparecem como cartões de entrada, com atalho para a página completa.
 */

type Tile = Piece & { project: string; slug: string; kind: Kind };
type Kind = "feed" | "story" | "count" | "kit";

const FILTERS: { id: Kind | "all"; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "feed", label: "Feed" },
  { id: "story", label: "Stories" },
  { id: "count", label: "Contagem" },
  { id: "kit", label: "Mídia kit" },
];

/** Junta as peças de todos os projetos e intercala os grupos para o mosaico ficar variado. */
function buildTiles(): Tile[] {
  const lists: Tile[][] = [];
  for (const d of designProjects) {
    for (const g of d.groups) {
      const kind: Kind = g.title === "Feed" ? "feed" : g.title === "Stories" ? "story" : g.title === "Contagem regressiva" ? "count" : "kit";
      let pieces = g.pieces;
      // stories repetem os temas do feed: deslocar a ordem evita o mesmo tema lado a lado
      if (kind === "story") pieces = [...pieces.slice(4), ...pieces.slice(0, 4)];
      if (kind === "count") pieces = [...pieces.slice(3, 6), ...pieces.slice(9), ...pieces.slice(0, 3), ...pieces.slice(6, 9)];
      lists.push(pieces.map((p) => ({ ...p, project: d.title, slug: d.slug, kind })));
    }
  }
  const out: Tile[] = [];
  const max = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
}

const ratioOf = (f: Piece["format"]) => (f === "story" ? "aspect-[9/16]" : f === "page" ? "aspect-[2000/2982]" : "aspect-[4/5]");
const PAGE = 12;
const heightOf = (f: Piece["format"]) => (f === "story" ? 1.78 : f === "page" ? 1.49 : 1.25);

/** Distribui as peças pela coluna mais curta, mantendo a ordem de leitura da esquerda para a direita. */
function masonry(tiles: Tile[], cols: number) {
  const columns: Tile[][] = Array.from({ length: cols }, () => []);
  const heights = new Array(cols).fill(0);
  for (const t of tiles) {
    const k = heights.indexOf(Math.min(...heights));
    columns[k].push(t);
    heights[k] += heightOf(t.format) + 0.12;
  }
  return columns;
}

export function Design() {
  const all = useMemo(buildTiles, []);
  const [filter, setFilter] = useState<Kind | "all">("all");
  const [shown, setShown] = useState(PAGE);
  const [light, setLight] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const lg = useMedia("(min-width: 1024px)");
  const md = useMedia("(min-width: 768px)");
  const cols = lg ? 4 : md ? 3 : 2;
  const go = useGo();

  const list = useMemo(() => (filter === "all" ? all : all.filter((t) => t.kind === filter)), [all, filter]);
  const visible = filter === "all" ? list.slice(0, shown) : list;
  const columns = useMemo(() => masonry(visible, cols), [visible, cols]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    all.forEach((t) => (c[t.kind] = (c[t.kind] ?? 0) + 1));
    return c;
  }, [all]);

  const root = useGsap<HTMLElement>((el) => {
    el.querySelectorAll("[data-lines]").forEach((t) => revealLines(t));
  });

  // entrada dos blocos: ao rolar e a cada troca de filtro
  const seen = useRef(new Set<string>());
  useEffect(() => {
    if (!grid.current || reducedMotion()) return;
    const fresh = Array.from(grid.current.querySelectorAll<HTMLElement>("[data-tile]")).filter((n) => !seen.current.has(n.dataset.tile!));
    fresh.forEach((n) => seen.current.add(n.dataset.tile!));
    const ctx = gsap.context(() => {
      gsap.from(fresh, { y: 50, autoAlpha: 0, duration: 0.9, stagger: 0.04, ease: "out", clearProps: "transform,opacity,visibility" });
    }, grid);
    return () => ctx.revert();
  }, [visible.length, filter]);

  const change = (f: Kind | "all") => {
    if (f === filter) return;
    seen.current.clear();
    setFilter(f);
    setShown(PAGE);
  };

  return (
    <section ref={root} id="design" data-theme="light" className="relative overflow-hidden pb-[12vh] pt-[16vh]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionLabel n="05" className="text-steel">
              Design gráfico
            </SectionLabel>
            <h2 data-lines className="h1 mt-8 max-w-[15ch]">
              Marcas e campanhas fora da tela
            </h2>
          </div>
        </div>

        {/* os projetos por trás da galeria */}
        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {designProjects.map((d) => (
            <button
              key={d.slug}
              onClick={() => go(`/design/${d.slug}`, { label: d.title })}
              data-cursor="link"
              className="group flex items-center gap-4 rounded-[14px] border border-ink/10 p-3 pr-5 text-left transition-colors duration-500 hover:border-ink/30"
            >
              <img src={d.thumb} alt="" loading="lazy" decoding="async" className="h-[72px] w-[116px] shrink-0 rounded-[8px] object-cover object-top" />
              <span className="min-w-0 flex-1">
                <span className="label block text-steel">
                  {d.category} · {d.year}
                </span>
                <span className="mt-1 block truncate text-[19px] font-[560] tracking-[-0.03em]">{d.title}</span>
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/15 transition-all duration-500 ease-expo group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                <Arrow className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>

        {/* filtros */}
        <div className="mt-14 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtrar peças">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => change(f.id)}
              data-cursor="link"
              className={clsx("chip transition-colors duration-500", filter === f.id ? "border-ink bg-ink text-paper" : "text-ink/60 hover:text-ink")}
            >
              {f.label}
              <span className={clsx("tabular-nums", filter === f.id ? "text-paper/50" : "text-ink/35")}>{String(counts[f.id] ?? 0).padStart(2, "0")}</span>
            </button>
          ))}
        </div>

        {/* mosaico */}
        <div ref={grid} className="mt-8 flex items-start gap-3 md:gap-4">
          {columns.map((col, ci) => (
            <div key={ci} className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
              {col.map((t) => (
                <button
                  key={t.src}
                  data-tile={t.src}
                  onClick={() => setLight(list.indexOf(t))}
                  data-cursor="open"
                  aria-label={`${t.project}: ${t.caption}`}
                  className="group block w-full text-left"
                >
                  <span className="block overflow-hidden rounded-[10px] bg-ink">
                    <img src={t.sm} alt={`${t.project}: ${t.caption}`} loading="lazy" decoding="async" className={clsx("w-full object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]", ratioOf(t.format))} />
                  </span>
                  <span className="label mt-2 flex items-center justify-between gap-3 text-steel">
                    <span className="truncate normal-case tracking-normal">{t.caption}</span>
                    <span className="shrink-0 text-ink/40">{t.project}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {filter === "all" && shown < list.length && (
          <div className="mt-10 flex justify-center">
            <Btn onClick={() => setShown((n) => n + 12)} variant="solid" arrow="ne">
              {`Ver mais peças (${list.length - shown})`}
            </Btn>
          </div>
        )}
      </div>

      <Lightbox
        items={list.map((t) => ({ src: t.src, caption: `${t.project} · ${t.caption}` }))}
        index={light}
        onChange={(i) => setLight(i)}
        onClose={() => setLight(null)}
      />
    </section>
  );
}
