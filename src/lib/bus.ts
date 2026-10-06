/** Barramento mínimo de eventos entre React, GSAP e WebGL. */
type Handler = (payload?: unknown) => void;
const map = new Map<string, Set<Handler>>();

export const bus = {
  on(evt: string, fn: Handler) {
    if (!map.has(evt)) map.set(evt, new Set());
    map.get(evt)!.add(fn);
    return () => {
      map.get(evt)?.delete(fn);
    };
  },
  emit(evt: string, payload?: unknown) {
    map.get(evt)?.forEach((fn) => fn(payload));
  },
};

/** Estado global simples (lido por loops de animação sem re-render). */
export const app = {
  ready: false, // preloader terminou
  route: "/",
};
