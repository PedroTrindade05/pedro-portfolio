import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { decayPointer } from "@/lib/pointer";
import { hasWebGL, isMobile } from "@/lib/env";

/**
 * Palco WebGL único: um canvas fixo por cima do conteúdo (pointer-events: none)
 * que desenha várias "camadas", cada uma presa ao retângulo de um elemento do DOM.
 * Só renderiza quando alguma camada está visível, e ajusta a resolução sozinho
 * conforme o tempo de quadro.
 */

export type Rect = { x: number; y: number; w: number; h: number };

export interface Layer {
  /** Ordem de desenho (menor primeiro). */
  order: number;
  /** Retângulo em px CSS da viewport onde a camada desenha, ou null se invisível. */
  rect(): Rect | null;
  /** Desenha a camada. `dt` em segundos. */
  render(renderer: THREE.WebGLRenderer, rect: Rect, dt: number, time: number): void;
  /** Chamado quando a resolução do canvas muda. */
  resize?(dpr: number): void;
}

class Stage {
  renderer: THREE.WebGLRenderer | null = null;
  canvas: HTMLCanvasElement | null = null;
  layers = new Set<Layer>();
  quality = 1;
  dpr = 1;
  private frames = 0;
  private acc = 0;
  private idleCleared = false;
  private time = 0;
  private running = false;

  get ok() {
    return !!this.renderer;
  }

  mount(parent: HTMLElement) {
    if (this.renderer || !hasWebGL()) return;
    const canvas = document.createElement("canvas");
    canvas.className = "gl-stage";
    canvas.setAttribute("aria-hidden", "true");
    parent.appendChild(canvas);
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      });
    } catch {
      canvas.remove();
      return;
    }
    this.canvas = canvas;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;
    // cenas com materiais PBR (heros 3D); os shaders próprios não usam tone mapping
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.quality = isMobile() ? 0.75 : 1;
    this.applySize();
    window.addEventListener("resize", this.applySize);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.start();
  }

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  private start() {
    if (this.running || !this.renderer) return;
    this.running = true;
    gsap.ticker.add(this.tick);
  }

  private stop() {
    this.running = false;
    gsap.ticker.remove(this.tick);
  }

  private applySize = () => {
    if (!this.renderer) return;
    const base = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 1.5);
    this.dpr = Math.max(0.5, base * this.quality);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.layers.forEach((l) => l.resize?.(this.dpr));
  };

  add(layer: Layer) {
    this.layers.add(layer);
    return () => this.layers.delete(layer);
  }

  private tick = (_t: number, deltaMs: number) => {
    const r = this.renderer;
    if (!r) return;
    const dt = Math.min(deltaMs / 1000, 1 / 20);
    this.time += dt;
    decayPointer();

    const H = window.innerHeight;
    const W = window.innerWidth;
    const visible: { layer: Layer; rect: Rect }[] = [];
    this.layers.forEach((layer) => {
      const rect = layer.rect();
      if (rect && rect.w > 1 && rect.h > 1 && rect.x < W && rect.y < H && rect.x + rect.w > 0 && rect.y + rect.h > 0) {
        visible.push({ layer, rect });
      }
    });

    if (!visible.length) {
      if (!this.idleCleared) {
        r.setScissorTest(false);
        r.clear();
        this.idleCleared = true;
      }
      return;
    }
    this.idleCleared = false;

    visible.sort((a, b) => a.layer.order - b.layer.order);
    r.setScissorTest(false);
    r.clear();
    r.setScissorTest(true);
    for (const { layer, rect } of visible) {
      const y = H - (rect.y + rect.h);
      r.setViewport(rect.x, y, rect.w, rect.h);
      r.setScissor(rect.x, y, rect.w, rect.h);
      layer.render(r, rect, dt, this.time);
    }

    this.adapt(deltaMs);
  };

  /** Resolução adaptativa: mede ~1 s de quadros e sobe/desce a qualidade. */
  private adapt(deltaMs: number) {
    this.frames++;
    this.acc += deltaMs;
    if (this.frames < 50) return;
    const avg = this.acc / this.frames;
    this.frames = 0;
    this.acc = 0;
    let q = this.quality;
    if (avg > 24) q = Math.max(0.5, q - 0.15);
    else if (avg < 14 && q < 1) q = Math.min(1, q + 0.1);
    if (q !== this.quality) {
      this.quality = q;
      this.applySize();
    }
  }
}

export const stage = new Stage();

/** Triângulo que cobre a tela inteira (mais barato que um quad). */
export function fullscreenTriangle() {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  return g;
}

/** Converte o retângulo de um elemento para Rect. */
export function elementRect(el: Element | null): Rect | null {
  if (!el) return null;
  const b = el.getBoundingClientRect();
  return { x: b.left, y: b.top, w: b.width, h: b.height };
}
