/**
 * Porteiro de visibilidade: um IntersectionObserver compartilhado diz se o elemento de uma
 * cena 3D está perto da tela. Assim a cena só pergunta a posição do elemento
 * (getBoundingClientRect força cálculo de layout) quando realmente pode ser desenhada.
 */
const state = new WeakMap<Element, boolean>();
let io: IntersectionObserver | null = null;

export function isNear(el: Element | null) {
  if (!el) return false;
  if (!io) {
    io = new IntersectionObserver(
      (entries) => entries.forEach((e) => state.set(e.target, e.isIntersecting)),
      { rootMargin: "200px 0px 200px 0px" },
    );
  }
  const known = state.get(el);
  if (known === undefined) {
    // primeira vez: observa e assume visível até o observador responder (evita piscar)
    state.set(el, true);
    io.observe(el);
    return true;
  }
  return known;
}
