import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { type Layer, type Rect } from "./stage";
import { isNear } from "./gate";

let envTex: THREE.Texture | null = null;

/** Ambiente de estúdio (softboxes) para reflexos realistas, gerado uma vez só. */
export function studioEnv(renderer: THREE.WebGLRenderer) {
  if (envTex) return envTex;
  const pm = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  envTex = pm.fromScene(room, 0.035).texture;
  room.dispose?.();
  pm.dispose();
  return envTex;
}

/**
 * Base das cenas 3D presas a um elemento do DOM: câmera em perspectiva,
 * limpeza de profundidade por camada e estado de entrada/rolagem.
 */
export abstract class Scene3D implements Layer {
  order = 1;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  /** 0..1 entrada */
  appear = 0;
  /** 0..1 rolagem do hero */
  progress = 0;
  enabled = true;
  protected el: () => Element | null;
  protected ready = false;
  /** false enquanto os shaders compilam em paralelo (a cena não desenha, mas a página não trava) */
  protected compiled = true;
  /** origem e tamanho da vista em px do dispositivo (para efeitos em espaço de tela) */
  vp = new THREE.Vector4();

  constructor(anchor: () => Element | null) {
    this.el = anchor;
  }

  rect(): Rect | null {
    if (!this.enabled || this.appear <= 0.001) return null;
    const el = this.el();
    if (!el || !isNear(el)) return null;
    const b = el.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  }

  /** Chamado uma vez com o renderer, para criar o que depende dele (ambiente, texturas). */
  protected abstract setup(renderer: THREE.WebGLRenderer): void;
  protected abstract update(dt: number, time: number, rect: Rect): void;

  render(renderer: THREE.WebGLRenderer, rect: Rect, dt: number, time: number) {
    if (!this.ready) {
      this.setup(renderer);
      this.ready = true;
    }
    const dpr = renderer.getPixelRatio();
    this.vp.set(rect.x * dpr, (window.innerHeight - rect.y - rect.h) * dpr, rect.w * dpr, rect.h * dpr);
    this.camera.aspect = rect.w / rect.h;
    this.camera.updateProjectionMatrix();
    this.update(dt, time, rect);
    if (!this.compiled) return;
    renderer.clearDepth();
    renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
    });
  }
}

/** Ponteiro em coordenadas -1..1 relativas a um retângulo. */
export function localPointer(px: number, py: number, r: Rect) {
  return { x: ((px - r.x) / r.w) * 2 - 1, y: -(((py - r.y) / r.h) * 2 - 1) };
}
