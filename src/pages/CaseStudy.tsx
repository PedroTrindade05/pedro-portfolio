import { useEffect, useRef } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { getProject, nextProject, projects } from "@/content/work";
import { gsap, SplitText } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { revealLines, revealUp } from "@/lib/reveal";
import { reducedMotion } from "@/lib/env";
import { showcase } from "@/gl/showcase";
import { BrowserFrame, PhoneFrame } from "@/components/Frames";
import { Btn, SectionLabel, Arrow } from "@/components/ui";
import { useGo } from "@/components/Transition";
import { Footer } from "@/sections/Footer";

export default function CaseStudy() {
  const { slug = "" } = useParams();
  const p = getProject(slug);
  if (!p) return <Navigate to="/" replace />;
  return <CaseInner key={p.slug} slug={p.slug} />;
}

function CaseInner({ slug }: { slug: string }) {
  const p = getProject(slug)!;
  const next = nextProject(slug);
  const location = useLocation();
  const go = useGo();
  const heroImg = useRef<HTMLImageElement>(null);
  const fromPreview = !!(location.state as { fromPreview?: boolean } | null)?.fromPreview;
  const idx = String(projects.indexOf(p) + 1).padStart(2, "0");
  const host = p.url ? new URL(p.url).host : `${p.title} · ${p.category}`;
  const desktop = p.shots.filter((s) => s.device === "desktop" && s.src !== p.cover);
  const mobile = p.shots.filter((s) => s.device === "mobile");

  useEffect(() => {
    document.title = `${p.title} · Pedro Trindade`;
    return () => {
      document.title = "Pedro Trindade · Front-end, UI/UX e Design";
    };
  }, [p.title]);

  // libera a prévia WebGL quando a capa real já está desenhada por baixo
  useEffect(() => {
    if (!fromPreview) return;
    const img = heroImg.current!;
    const done = () => requestAnimationFrame(() => showcase.release());
    if (img.complete) img.decode().then(done, done);
    else img.addEventListener("load", done, { once: true });
  }, [fromPreview]);

  const root = useGsap<HTMLElement>((el) => {
    const reduce = reducedMotion();
    const title = el.querySelector<HTMLElement>("[data-title]")!;
    const split = SplitText.create(title, { type: "words,chars", mask: "words" });
    if (!reduce) {
      gsap.from(split.words, { yPercent: 110, duration: 1.3, stagger: 0.06, ease: "out", delay: fromPreview ? 0.35 : 0.6 });
      gsap.from(el.querySelectorAll("[data-hero-fade]"), { autoAlpha: 0, y: 20, duration: 1, stagger: 0.06, delay: fromPreview ? 0.6 : 0.85 });
      gsap.to(heroImg.current, { yPercent: 12, scale: 1.06, ease: "none", scrollTrigger: { trigger: el.querySelector("[data-hero]"), start: "top top", end: "bottom top", scrub: true } });
      if (!fromPreview) gsap.from(heroImg.current, { scale: 1.2, duration: 2, ease: "out" });
    }
    el.querySelectorAll("[data-lines]").forEach((t) => revealLines(t));
    revealUp(el.querySelectorAll("[data-meta]"), el.querySelector("[data-metas]")!, { y: 20, stagger: 0.05 });
    revealUp(el.querySelectorAll("[data-hl]"), el.querySelector("[data-hls]")!, { y: 24, stagger: 0.06 });

    // galeria: cada imagem sobe e "assenta" ao entrar
    el.querySelectorAll<HTMLElement>("[data-shot]").forEach((s) => {
      if (reduce) return;
      gsap.fromTo(s, { y: 90, rotateX: 8, autoAlpha: 0 }, { y: 0, rotateX: 0, autoAlpha: 1, duration: 1.4, ease: "out", scrollTrigger: { trigger: s, start: "top 92%", once: true } });
    });
    el.querySelectorAll<HTMLElement>("[data-phone]").forEach((s, i) => {
      if (reduce) return;
      gsap.fromTo(s, { y: 120 + i * 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4, ease: "out", delay: i * 0.08, scrollTrigger: { trigger: s.parentElement, start: "top 85%", once: true } });
      gsap.to(s, { y: (i % 2 ? -1 : 1) * 40, ease: "none", scrollTrigger: { trigger: s.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });

    return () => split.revert();
  }, [slug]);

  return (
    <main ref={root}>
      {/* HERO: capa em tela cheia (mesmo enquadramento da prévia WebGL) */}
      <section data-hero data-theme="dark" className="relative h-[100svh] min-h-[560px] overflow-hidden">
        <img ref={heroImg} src={p.cover} alt={`Capa do projeto ${p.title}`} className="absolute inset-0 h-full w-full object-cover" {...{ fetchpriority: "high" }} decoding="async" />
        <div className="absolute inset-0 bg-ink/[0.62]" />
        <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-ink to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-transparent" />
        <div className="wrap absolute inset-x-0 bottom-0 pb-[7vh]">
          <p data-hero-fade className="label mb-6 flex flex-wrap items-center gap-3 text-silver">
            <span className="text-acc">({idx})</span> {p.category} <span className="opacity-40">/</span> {p.year} <span className="opacity-40">/</span> {p.client}
          </p>
          <h1 data-title className="max-w-[14ch] text-[clamp(52px,9.4vw,170px)] font-[620] leading-[0.88] tracking-[-0.055em]">
            {p.title}
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <p data-hero-fade className="max-w-[46ch] text-[17px] leading-relaxed text-silver">
              {p.tagline}. {p.type}.
            </p>
            <p data-hero-fade className="label flex items-center gap-3 text-silver-2">
              Role para ver o case
              <Arrow dir="s" className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </section>

      {/* VISÃO GERAL */}
      <section data-theme="dark" className="wrap grid gap-14 py-[14vh] md:grid-cols-12 md:gap-8">
        <aside data-metas className="md:col-span-4 lg:col-span-3">
          <div className="space-y-6 md:sticky md:top-[calc(var(--header-h)+24px)]">
            {[
              ["Cliente", p.client],
              ["Ano", p.year],
              ["Tipo", p.type],
              ["Meu papel", p.roles.join(", ")],
            ].map(([k, v]) => (
              <div key={k} data-meta className="border-t border-white/10 pt-4">
                <p className="label text-steel">{k}</p>
                <p className="mt-1.5 text-[16px] font-medium tracking-[-0.01em]">{v}</p>
              </div>
            ))}
            <div data-meta className="border-t border-white/10 pt-4">
              <p className="label text-steel">Stack</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <span key={s} className="chip text-silver">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            {p.url && (
              <div data-meta className="pt-2">
                <Btn href={p.url} external variant="acc">
                  Ver no ar
                </Btn>
              </div>
            )}
          </div>
        </aside>

        <div className="md:col-span-8 md:col-start-5 lg:col-span-8 lg:col-start-5">
          <SectionLabel n="01" className="text-silver-2">
            O projeto
          </SectionLabel>
          <p data-lines className="lead mt-8 text-[clamp(22px,2.3vw,38px)] leading-[1.18] tracking-[-0.025em] text-paper">
            {p.summary}
          </p>
          <p data-lines className="body-lg mt-10 max-w-[64ch] text-silver-2">
            {p.overview}
          </p>

          <div className="mt-16">
            <SectionLabel n="02" className="text-silver-2">
              Destaques
            </SectionLabel>
            <ol data-hls className="mt-8">
              {p.highlights.map((h, i) => (
                <li key={h} data-hl className="grid grid-cols-[48px_1fr] gap-4 border-t border-white/10 py-5 text-[17px] leading-snug tracking-[-0.01em] md:text-[19px]">
                  <span className="label pt-1.5 text-acc">{String(i + 1).padStart(2, "0")}</span>
                  <span>{h}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* GALERIA DESKTOP */}
      <section data-theme="dark" className="wrap pb-[12vh]" style={{ perspective: "1600px" }}>
        <SectionLabel n="03" className="mb-10 text-silver-2">
          Telas
        </SectionLabel>
        <div className="grid gap-x-6 gap-y-16 md:grid-cols-2">
          {desktop.map((s, i) => {
            // padrão inteira, meia, meia; uma meia sobrando no fim vira inteira
            const full = i % 3 === 0 || (i % 3 === 1 && i === desktop.length - 1);
            return (
              <div key={s.src} data-shot className={full ? "md:col-span-2" : ""}>
                <BrowserFrame src={s.src} alt={s.caption} host={host} />
                <p className="label mt-4 flex gap-3 text-silver-2">
                  <span className="text-steel">{String(i + 1).padStart(2, "0")}</span>
                  {s.caption}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* GALERIA MOBILE */}
      {mobile.length > 0 && (
        <section data-theme="light" className="relative overflow-hidden py-[14vh]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-3xl"
            style={{ background: p.accent }}
          />
          <div className="wrap relative">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionLabel n="04" className="text-steel">
                No celular
              </SectionLabel>
              <p className="max-w-[40ch] text-[15px] text-steel">Layout pensado para a tela pequena, não só encolhido.</p>
            </div>
            <div className="mx-auto mt-14 flex max-w-[1300px] flex-wrap justify-center gap-x-8 gap-y-12">
              {mobile.map((s) => (
                <div key={s.src} data-phone className="w-[min(290px,42vw)]">
                  <PhoneFrame src={s.src} alt={s.caption} />
                  <p className="label mt-5 text-center text-steel">{s.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRÓXIMO */}
      <section data-theme="dark" className="wrap py-[12vh]">
        <a
          href={`/trabalhos/${next.slug}`}
          onClick={(e) => {
            e.preventDefault();
            go(`/trabalhos/${next.slug}`, { label: next.title });
          }}
          data-cursor="view"
          data-cursor-label="Próximo"
          className="group grid items-end gap-8 border-t border-white/10 pt-10 md:grid-cols-[1fr_auto]"
        >
          <div>
            <p className="label text-silver-2">Próximo projeto</p>
            <p className="mt-4 text-[clamp(44px,8vw,140px)] font-[620] leading-[0.9] tracking-[-0.055em] transition-transform duration-700 ease-expo group-hover:translate-x-[1.5vw]">
              {next.title}
            </p>
            <p className="mt-3 text-[15px] text-silver-2">
              {next.category} · {next.year}
            </p>
          </div>
          <div className="relative w-full overflow-hidden rounded-[14px] md:w-[30vw]">
            <img src={next.thumb} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.06]" />
          </div>
        </a>
        <div className="mt-12 flex flex-wrap gap-3">
          <Btn to="/#trabalhos" variant="ghost" arrow="e">
            Todos os projetos
          </Btn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
