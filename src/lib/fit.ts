/**
 * Ajusta o font-size de `el` para que `measure` (um filho inline, sem quebra de linha)
 * ocupe exatamente `target()` px de largura. Reaplica no resize e quando as fontes carregam.
 */
export function fitText(el: HTMLElement, measure: HTMLElement, target: () => number, min = 24) {
  let lastW = -1;
  const apply = (force = false) => {
    const vw = window.innerWidth;
    if (vw === lastW && !force) return;
    lastW = vw;
    el.style.fontSize = "100px";
    const w = measure.getBoundingClientRect().width;
    if (!w) return;
    el.style.fontSize = `${Math.max(min, (100 * target()) / w)}px`;
  };
  apply(true);
  const onResize = () => apply();
  window.addEventListener("resize", onResize);
  document.fonts?.ready.then(() => apply(true));
  return () => window.removeEventListener("resize", onResize);
}
