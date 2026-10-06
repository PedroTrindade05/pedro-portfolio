import { useRef } from "react";
import clsx from "clsx";
import { profile } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGsap, onReady } from "@/lib/hooks";
import { stage } from "@/gl/stage";
import { TrindadeScene } from "@/gl/heroTrindade";
import { isMobile, isTouch, reducedMotion } from "@/lib/env";
import { fitText } from "@/lib/fit";
import { pointer } from "@/lib/pointer";
import { Btn } from "@/components/ui";
import { HeroMeta, HeroFoot, heroIntro } from "./shared";

/**
 * Hero · Trindade: os anéis borromeanos (cada anel = uma disciplina) num palco de estúdio.
 * O destaque passa de anel em anel sozinho; o mouse num anel o destaca; arrastar gira o conjunto. Atrás, um foco de luz difuso acompanha o cursor.
 */
export function HeroTrindade() {
  const glRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const nameInner = useRef<HTMLSpanElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const root = useGsap<HTMLElement>((el) => {
    const scene = new TrindadeScene(() => glRef.current);
    const off = stage.add(scene);

    const offFit = fitText(nameRef.current!, nameInner.current!, () => (isMobile() ? window.innerWidth - 32 : window.innerWidth * 0.4));

    const intro = heroIntro(el, (tl) => {
      tl.to(scene, { appear: 1, duration: reducedMotion() ? 0.01 : 2.4, ease: "expo.out" }, 0);
      tl.fromTo(spotRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2 }, 0.2);
    });
    const offReady = onReady(intro.start);

    // arrastar gira o conjunto
    const inHero = (e: PointerEvent) => {
      const r = glRef.current?.getBoundingClientRect();
      return r && e.clientY > r.top && e.clientY < r.bottom && !(e.target as HTMLElement).closest("a,button");
    };
    const down = (e: PointerEvent) => inHero(e) && scene.pointerDown(e.clientX, e.clientY);
    const move = (e: PointerEvent) => scene.pointerMove(e.clientX, e.clientY);
    const up = () => scene.pointerUp();
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);

    // foco de luz do fundo segue o cursor com atraso
    const spot = spotRef.current!;
    const sx = gsap.quickTo(spot, "x", { duration: 1.6, ease: "power3.out" });
    const sy = gsap.quickTo(spot, "y", { duration: 1.6, ease: "power3.out" });
    const follow = () => {
      if (isTouch()) return;
      sx(pointer.nx * window.innerWidth * 0.18);
      sy(-pointer.ny * window.innerHeight * 0.14);
    };
    gsap.ticker.add(follow);

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom top",
      onUpdate: (s) => (scene.progress = s.progress),
    });

    return () => {
      offReady();
      intro.cleanup();
      offFit();
      st.kill();
      off();
      scene.dispose();
      gsap.ticker.remove(follow);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  });

  return (
    <section ref={root} id="topo" data-theme="dark" className={clsx("relative h-[100svh] min-h-[640px] overflow-hidden", !isTouch() && "cursor-grab active:cursor-grabbing")}>
      {/* fundo de estúdio: foco difuso que segue o cursor + horizonte suave */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_0%,#16171a_0%,#0a0a0b_60%)]" />
        <div ref={spotRef} className="absolute left-[44%] top-[2%] h-[100vmin] w-[100vmin] rounded-full bg-[radial-gradient(closest-side,rgba(214,220,232,0.11),rgba(214,220,232,0.03)_55%,transparent)] max-md:left-[0%]" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div ref={glRef} aria-hidden className="absolute inset-0" />

      <HeroMeta />

      <div data-parallax className="wrap absolute inset-x-0 bottom-[11vh] md:bottom-auto md:top-[22vh]">
        <h1 ref={nameRef} aria-label={profile.full} className="display pointer-events-none text-paper">
          <span ref={nameInner} className="inline-flex flex-col whitespace-nowrap">
            <span data-word className="block">
              {profile.first}
            </span>
            <span data-word className="block">
              {profile.last}
            </span>
          </span>
        </h1>
        <div data-fade className="mt-10 flex flex-wrap gap-3">
          <Btn to="/#trabalhos" variant="solid">
            Ver trabalhos
          </Btn>
          <Btn href={`mailto:${profile.email}`} variant="ghost">
            Vamos conversar
          </Btn>
        </div>
      </div>

      <HeroFoot hint={isTouch() ? "" : ""} />
    </section>
  );
}
