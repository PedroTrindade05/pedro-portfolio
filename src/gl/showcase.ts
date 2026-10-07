import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { stage, type Layer, type Rect } from "./stage";
import { isNear } from "./gate";

/**
 * Vitrine 3D dos projetos: as capas ficam num trilho circular em perspectiva,
 * uma em foco no centro e as vizinhas girando para trás, com reflexo no "chão".
 * Arrastar, setas, miniaturas e avanço automático movem o trilho; o conteúdo
 * desliza dentro de cada moldura (parallax) e a velocidade curva os planos.
 * No clique, a capa ativa cresce até cobrir a tela e vira o hero do case.
 */

const vert = /* glsl */ `
uniform float uBend;
uniform float uCurve;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float sx = sin(uv.x * 3.14159);
  p.z += sx * uBend + (uv.x - 0.5) * (uv.x - 0.5) * uCurve;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const frag = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uCover;
uniform vec2 uSize;
uniform float uRadius;
uniform float uDim;
uniform float uParallax;
uniform float uShift;
uniform float uAlpha;
uniform float uReflect;
uniform float uLoaded;
uniform float uZoom;
uniform float uEdge;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float fade = 1.0;
  if (uReflect > 0.5) {
    // reflexo: espelhado e sumindo para baixo
    fade = smoothstep(0.62, 1.0, uv.y) * 0.16;
    if (fade < 0.002) discard;
  }

  vec2 px = uv * uSize;
  vec2 q = abs(px - uSize * 0.5) - (uSize * 0.5 - uRadius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float mask = 1.0 - smoothstep(-1.0, 0.6, d);
  if (mask < 0.002) discard;

  vec2 c = (uv - 0.5) * uCover * uZoom + 0.5;
  c.x += uParallax;
  if (uReflect > 0.5) c.y = 1.0 - c.y;
  vec3 col;
  col.r = texture2D(uTex, c + vec2(uShift, 0.0)).r;
  col.g = texture2D(uTex, c).g;
  col.b = texture2D(uTex, c - vec2(uShift, 0.0)).b;

  // enquanto a textura não chega: grafite com brilho suave
  vec3 ph = mix(vec3(0.07), vec3(0.11), uv.y);
  col = mix(ph, col, uLoaded);

  col *= uDim;
  // fio prateado na borda
  float rim = smoothstep(1.6, 0.0, abs(d + 0.8)) * uEdge;
  col = mix(col, vec3(0.85, 0.87, 0.9), rim * 0.55);

  float a = mask * uAlpha * fade;
  gl_FragColor = vec4(col * a, a);
}
`;

type Card = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  mirror: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  src: string;
  full: string;
  aspect: number;
  loaded: boolean;
  upgraded: boolean;
};

class Showcase implements Layer {
  order = 3;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, 1, 10, 20000);
  private cards: Card[] = [];
  private loader = new THREE.TextureLoader();
  private el: HTMLElement | null = null;
  /** posição do palco, lida uma vez por quadro em rect() e reaproveitada */
  private er = { left: 0, top: 0, width: 1, height: 1 };
  private upgradeTimer = 0;
  private off: (() => void) | null = null;
  private geo = new THREE.PlaneGeometry(1, 1, 32, 18);

  /** posição contínua no trilho (índice fracionário) */
  progress = 0;
  target = 0;
  velocity = 0;
  dragging = false;
  /** 0..1 entrada da seção */
  appear = 0;
  /** 0..1 expansão do card ativo até a tela cheia */
  expand = 0;
  alpha = 1;
  onChange: ((i: number) => void) | null = null;
  private lastActive = -1;
  private time = 0;

  get count() {
    return this.cards.length;
  }

  get active() {
    const n = this.count || 1;
    return ((Math.round(this.progress) % n) + n) % n;
  }

  attach() {
    if (!this.off) this.off = stage.add(this);
  }

  bind(el: HTMLElement | null) {
    this.el = el;
  }

  /** `rails`: capas leves usadas no trilho; `fulls`: capas grandes, carregadas só para o card ativo. */
  setItems(rails: string[], fulls: string[]) {
    const srcs = rails;
    if (this.cards.length && this.cards.map((c) => c.src).join() === srcs.join()) return;
    this.cards.forEach((c) => {
      this.scene.remove(c.mesh, c.mirror);
      c.mesh.material.dispose();
      c.mirror.material.dispose();
      (c.mesh.material.uniforms.uTex.value as THREE.Texture | null)?.dispose?.();
    });
    const blank = new THREE.DataTexture(new Uint8Array([18, 18, 20, 255]), 1, 1);
    blank.needsUpdate = true;
    this.cards = srcs.map((src, ci) => {
      const make = (reflect: number) =>
        new THREE.ShaderMaterial({
          vertexShader: vert,
          fragmentShader: frag,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.CustomBlending,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneMinusSrcAlphaFactor,
          uniforms: {
            uTex: { value: blank },
            uCover: { value: new THREE.Vector2(1, 1) },
            uSize: { value: new THREE.Vector2(1, 1) },
            uRadius: { value: 16 },
            uDim: { value: 1 },
            uParallax: { value: 0 },
            uShift: { value: 0 },
            uAlpha: { value: 1 },
            uReflect: { value: reflect },
            uLoaded: { value: 0 },
            uZoom: { value: 0.9 },
            uEdge: { value: 1 },
            uBend: { value: 0 },
            uCurve: { value: 0 },
          },
        });
      const mesh = new THREE.Mesh(this.geo, make(0));
      const mirror = new THREE.Mesh(this.geo, make(1));
      mesh.frustumCulled = mirror.frustumCulled = false;
      this.scene.add(mirror, mesh);
      return { mesh, mirror, src, full: fulls[ci], aspect: 1.6, loaded: false, upgraded: false };
    });
  }

  /** Carrega as capas a partir do card ativo, para as vizinhas chegarem primeiro. */
  load(stagger = 250) {
    const n = this.count;
    const order = Array.from({ length: n }, (_, k) => (this.active + (k % 2 ? Math.ceil(k / 2) : -k / 2) + n * 2) % n);
    order.forEach((i, k) => {
      const c = this.cards[i];
      if (c.loaded) return;
      setTimeout(() => {
        this.loader.load(c.src, (tex) => {
          this.prepareTexture(tex);
          const img = tex.image as HTMLImageElement;
          c.aspect = img.width / img.height;
          this.setCardTexture(c, tex);
          c.loaded = true;
          gsap.to([c.mesh.material.uniforms.uLoaded, c.mirror.material.uniforms.uLoaded], { value: 1, duration: 0.8 });
        });
      }, k * stagger);
    });
  }

  private prepareTexture(tex: THREE.Texture) {
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 4;
    // envia para a placa de vídeo já, fora do primeiro quadro em que o card aparece
    stage.renderer?.initTexture(tex);
  }

  private setCardTexture(c: Card, tex: THREE.Texture) {
    const old = c.mesh.material.uniforms.uTex.value as THREE.Texture | null;
    c.mesh.material.uniforms.uTex.value = tex;
    c.mirror.material.uniforms.uTex.value = tex;
    if (old && old.image && (old as THREE.Texture & { isDataTexture?: boolean }).isDataTexture !== true && old !== tex) old.dispose();
  }

  /** Troca a capa leve do card pela grande (usada quando o card vira o ativo ou vai abrir). */
  upgrade(i: number, timeout = 800) {
    const c = this.cards[i];
    if (!c || c.upgraded) return Promise.resolve();
    c.upgraded = true;
    return new Promise<void>((res) => {
      const done = () => res();
      const t = setTimeout(done, timeout);
      this.loader.load(
        c.full,
        (tex) => {
          this.prepareTexture(tex);
          const img = tex.image as HTMLImageElement;
          c.aspect = img.width / img.height;
          this.setCardTexture(c, tex);
          clearTimeout(t);
          done();
        },
        undefined,
        () => {
          c.upgraded = false;
          clearTimeout(t);
          done();
        },
      );
    });
  }

  /** Vai para o card `i` pelo caminho mais curto no círculo. */
  goTo(i: number) {
    const n = this.count;
    const cur = this.target;
    let d = (((i - cur) % n) + n) % n;
    if (d > n / 2) d -= n;
    this.target = Math.round(cur + d);
  }

  step(dir: number) {
    this.target = Math.round(this.target) + dir;
  }

  /** Retângulo (px) que o card ativo ocupa no palco, para o teste de clique. */
  activeRect(): Rect | null {
    if (!this.el) return null;
    const b = this.er;
    const { w, h } = this.cardSize(b.width);
    return { x: b.left + b.width / 2 - w / 2, y: b.top + this.cardTop(b.height, h), w, h };
  }

  private cardSize(stageW: number) {
    const w = Math.min(stageW * (stageW < 768 ? 0.8 : 0.5), 1000);
    return { w, h: w * 0.625 };
  }

  private cardTop(stageH: number, h: number) {
    return Math.max(0, (stageH - h * 1.2) / 2);
  }

  rect(): Rect | null {
    if (this.alpha <= 0.001 || !this.count) return null;
    if (this.expand > 0) return { x: 0, y: 0, w: innerWidth, h: innerHeight };
    if (!isNear(this.el)) return null;
    const b = this.el!.getBoundingClientRect();
    this.er = { left: b.left, top: b.top, width: b.width, height: b.height };
    if (b.bottom < -50 || b.top > innerHeight + 50) return null;
    return { x: 0, y: 0, w: innerWidth, h: innerHeight };
  }

  render(renderer: THREE.WebGLRenderer, rect: Rect, dt: number, time: number) {
    this.time = time;
    const W = rect.w;
    const H = rect.h;
    const cam = this.camera;
    cam.aspect = W / H;
    cam.position.set(0, 0, H / 2 / Math.tan((cam.fov * Math.PI) / 360));
    cam.updateProjectionMatrix();

    // movimento: segue o alvo com amortecimento (o arraste mexe no alvo direto)
    const prev = this.progress;
    const k = 1 - Math.exp(-dt * (this.dragging ? 14 : 5.5));
    this.progress += (this.target - this.progress) * k;
    const v = (this.progress - prev) / Math.max(dt, 1 / 240);
    this.velocity += (v - this.velocity) * 0.25;

    const act = this.active;
    if (act !== this.lastActive) {
      this.lastActive = act;
      this.onChange?.(act);
      clearTimeout(this.upgradeTimer);
      // só baixa a capa grande para o cache; o envio à placa de vídeo acontece no clique (open)
      this.upgradeTimer = window.setTimeout(() => {
        const full = this.cards[act]?.full;
        if (full) new Image().src = full;
      }, 400);
    }

    const b = this.el ? this.er : { left: 0, top: 0, width: W, height: H };
    const { w: cw, h: ch } = this.cardSize(b.width);
    const cyScreen = b.top + this.cardTop(b.height, ch) + ch / 2;
    const cxScreen = b.left + b.width / 2;
    const e = this.expand;
    const n = this.count;
    const speed = Math.min(1, Math.abs(this.velocity) / 6);
    const mobile = b.width < 768;

    // recorte: só o palco, a não ser durante a expansão
    if (e <= 0) {
      // folga acima do palco para a borda dos cards girados não ser cortada
      const top = Math.max(0, b.top - ch * 0.14);
      const bottom = Math.min(H, b.top + b.height);
      if (bottom <= top) return;
      renderer.setScissor(0, H - bottom, W, bottom - top);
    }

    for (let i = 0; i < n; i++) {
      const c = this.cards[i];
      let d = (((i - this.progress) % n) + n) % n;
      if (d > n / 2) d -= n;
      const ad = Math.abs(d);
      const isActive = i === act;

      // trilho: espaçamento que comprime com a distância, giro para dentro e profundidade
      const spread = mobile ? 0.86 : 0.74;
      const xUnits = ad < 1 ? ad * spread : spread + (ad - 1) * (mobile ? 0.5 : 0.42);
      let x = Math.sign(d) * xUnits * cw;
      let y = -ad * ch * 0.02;
      let z = -ad * cw * 0.4 - Math.max(0, ad - 1) * cw * 0.12;
      let rotY = -Math.max(-1.8, Math.min(1.8, d)) * 0.42;
      let w = cw;
      let h = ch;
      let alpha = Math.max(0, 1 - Math.max(0, ad - 2.6) / 0.8);
      alpha *= this.alpha;

      // entrada da seção: os cards vêm do fundo
      const ap = this.appear;
      z -= (1 - ap) * (800 + ad * 300);
      alpha *= Math.min(1, ap * 1.4 - ad * 0.08);
      alpha = Math.max(0, alpha);

      // expansão do ativo até a tela cheia; os outros somem
      if (e > 0) {
        if (isActive) {
          x = x * (1 - e) + 0;
          z = z * (1 - e);
          rotY *= 1 - e;
          w = cw + (W - cw) * e;
          h = ch + (H - ch) * e;
        } else alpha *= 1 - Math.min(1, e * 2);
      }
      const baseX = cxScreen - W / 2;
      const baseY = -(cyScreen - H / 2);
      const wx = baseX * (1 - (isActive ? e : 0)) + x;
      const wy = baseY * (1 - (isActive ? e : 0)) + y;

      const dim = (1 - Math.min(ad, 2.5) * 0.26) * (0.92 + 0.08 * (1 - speed));
      const parallax = Math.max(-1, Math.min(1, d)) * 0.045 * (1 - e);
      const zoom = 0.9 + 0.1 * (isActive ? e : 0);
      const pa = w / h;
      const cover = pa > c.aspect ? new THREE.Vector2(1, c.aspect / pa) : new THREE.Vector2(pa / c.aspect, 1);
      const bend = (-this.velocity * 14 - 0) * (1 - e);

      for (const [m, reflect] of [
        [c.mesh, false],
        [c.mirror, true],
      ] as const) {
        const u = m.material.uniforms;
        u.uSize.value.set(w, h);
        u.uCover.value.copy(cover);
        u.uRadius.value = 16 * (1 - e);
        u.uDim.value = isActive ? 1 * (1 - 0.06 * speed) : dim;
        u.uParallax.value = parallax;
        u.uShift.value = speed * 0.006 * (1 - e);
        u.uAlpha.value = reflect ? alpha * (1 - e) : alpha;
        u.uZoom.value = zoom;
        u.uEdge.value = 1 - e;
        u.uBend.value = bend;
        u.uCurve.value = -ad * 30 * (1 - e);
        m.scale.set(w, h, 1);
        m.rotation.set(0, rotY, 0);
        if (reflect) {
          m.position.set(wx, wy - h - 8, z);
          m.visible = e < 1 && alpha > 0.01;
        } else {
          m.position.set(wx, wy, z);
          m.visible = alpha > 0.01;
        }
      }
      // ordem: os mais distantes primeiro
      c.mesh.renderOrder = 100 - Math.round(ad * 10) + (isActive ? 50 : 0);
      c.mirror.renderOrder = c.mesh.renderOrder - 200;
    }

    renderer.render(this.scene, cam);
  }

  /** Cresce o card ativo até a tela cheia (para abrir o case sem corte). */
  open() {
    gsap.killTweensOf(this, "expand");
    return this.upgrade(this.active).then(() => gsap.to(this, { expand: 1, duration: 1, ease: "inOut" }).then());
  }

  /** Some depois que a página do case já mostra a mesma imagem. */
  release() {
    if (this.expand <= 0) return;
    gsap.to(this, {
      alpha: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        this.expand = 0;
        this.alpha = 1;
      },
    });
  }

  /** Tempo atual (usado por quem quiser sincronizar efeitos). */
  get clock() {
    return this.time;
  }
}

export const showcase = new Showcase();
