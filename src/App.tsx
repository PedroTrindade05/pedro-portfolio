import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { stage } from "@/gl/stage";
import { getLenis, initScroll } from "@/lib/scroll";
import { app } from "@/lib/bus";
import { ScrollTrigger } from "@/lib/gsap";
import { TransitionProvider } from "@/components/Transition";
import { Header } from "@/components/Header";
import { Cursor } from "@/components/Cursor";
import { Preloader } from "@/components/Preloader";
import { PortalTransition } from "@/components/PortalTransition";
import { BackToTop } from "@/components/BackToTop";
import { projects } from "@/content/work";
import { profile } from "@/content/site";
import Home from "@/pages/Home";

const CaseStudy = lazy(() => import("@/pages/CaseStudy"));
const DesignCase = lazy(() => import("@/pages/DesignCase"));

/** Imagens que o preloader espera antes de abrir (o resto carrega sob demanda). */
const critical = [profile.photo, ...projects.slice(0, 6).map((p) => p.thumb)];

export default function App() {
  const glHost = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    initScroll();
    if (glHost.current) stage.mount(glHost.current);
    // adianta o código das páginas de case depois que a home abriu
    const id = setTimeout(() => {
      import("@/pages/CaseStudy");
      import("@/pages/DesignCase");
    }, 4000);
    return () => clearTimeout(id);
  }, []);

  // toda troca de rota começa no topo (a âncora, se houver, é tratada pela transição)
  useLayoutEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    app.route = location.pathname;
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(id);
  }, [location.pathname]);

  return (
    <TransitionProvider>
      <div ref={glHost} />
      <Header />
      <Suspense fallback={<div className="h-screen bg-ink" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trabalhos/:slug" element={<CaseStudy />} />
          <Route path="/design/:slug" element={<DesignCase />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <BackToTop />
      <PortalTransition />
      <Preloader assets={critical} />
      <Cursor />
      <div className="grain" aria-hidden />
    </TransitionProvider>
  );
}
