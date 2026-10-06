/** Ponteiro global em px da viewport + velocidade suavizada. Atualizado só por evento. */
export const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  /** -1..1, y para cima */
  nx: 0,
  ny: 0,
  vx: 0,
  vy: 0,
  active: false,
  down: false,
};

let lx = pointer.x;
let ly = pointer.y;
let lt = performance.now();

window.addEventListener(
  "pointermove",
  (e) => {
    const now = performance.now();
    const dt = Math.max(8, now - lt);
    pointer.vx = pointer.vx * 0.6 + ((e.clientX - lx) / dt) * 16 * 0.4;
    pointer.vy = pointer.vy * 0.6 + ((e.clientY - ly) / dt) * 16 * 0.4;
    lx = e.clientX;
    ly = e.clientY;
    lt = now;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.active = true;
  },
  { passive: true },
);
window.addEventListener("pointerdown", () => (pointer.down = true), { passive: true });
window.addEventListener("pointerup", () => (pointer.down = false), { passive: true });
document.documentElement.addEventListener("pointerleave", () => (pointer.active = false));

/** Decai a velocidade quando o mouse para (chamar 1x por frame). */
export function decayPointer() {
  pointer.vx *= 0.88;
  pointer.vy *= 0.88;
}
