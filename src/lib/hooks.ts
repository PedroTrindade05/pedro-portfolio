import { useEffect, useLayoutEffect, useRef, useState, type DependencyList } from "react";
import { gsap } from "./gsap";
import { app, bus } from "./bus";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Roda animações GSAP dentro de um contexto com escopo no elemento retornado,
 * revertendo tudo ao desmontar (seguro com StrictMode).
 */
export function useGsap<T extends HTMLElement = HTMLElement>(cb: (self: T) => void | (() => void), deps: DependencyList = []) {
  const ref = useRef<T>(null);
  useIsoLayoutEffect(() => {
    if (!ref.current) return;
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = cb(ref.current!);
    }, ref.current);
    return () => {
      cleanup?.();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** true depois que o preloader termina (ou imediatamente se já terminou). */
export function useReady() {
  const [ready, setReady] = useState(app.ready);
  useEffect(() => {
    if (app.ready) return setReady(true);
    return bus.on("ready", () => setReady(true));
  }, []);
  return ready;
}

/** Executa `fn` quando o site estiver pronto (após o preloader). */
export function onReady(fn: () => void) {
  if (app.ready) {
    fn();
    return () => {};
  }
  return bus.on("ready", fn);
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}
