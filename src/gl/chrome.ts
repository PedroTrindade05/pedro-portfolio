import * as THREE from "three";
import { chromeFragment, chromeVertex } from "./chromeShader";
import { fullscreenTriangle, type Layer, type Rect } from "./stage";
import { pointer } from "@/lib/pointer";
import { accentRGB } from "@/lib/accent";
import { isTouch } from "@/lib/env";
import { isNear } from "./gate";

type BallDef = { r: number; R: number; a: number; b: number; c: number; p: number; q: number; s: number };

const tmpM4 = new THREE.Matrix4();
const tmpE = new THREE.Euler();
const tmpM3 = new THREE.Matrix3();

/** Uma vista de metal líquido presa a um elemento do DOM. */
export class ChromeLayer implements Layer {
  order: number;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  getAnchor: () => Element | null;

  // ---- estado público (animado por GSAP de fora) ----
  /** 0..1 aparição (raio das esferas / escala do glifo). */
  appear = 0;
  /** espalhamento extra das esferas (intro e clique). */
  scatter = 0;
  /** 0 = estúdio escuro, 1 = estúdio claro. */
  light = 0;
  /** pesos dos glifos (código, cursor, caneta). */
  weights = new THREE.Vector3(1, 0, 0);
  wobble = 0;
  /** deslocamento do centro do objeto em unidades da vista (x: fração da meia-largura, y: da meia-altura). */
  center = new THREE.Vector2(0, 0);
  /** tamanho do objeto relativo à meia-altura da vista. */
  size = 0.55;
  /** progresso externo (ex.: rolagem do hero), usado para girar/derreter. */
  progress = 0;
  alpha = 1;
  enabled = true;
  followPointer = true;

  private mode: 0 | 1;
  private balls: BallDef[] = [];
  private pointerBall = new THREE.Vector3(0, 0, 0.6);
  private pointerVel = new THREE.Vector3();
  private rot = new THREE.Vector2();
  private impulse = 0;
  private uBalls: THREE.Vector4[];

  constructor(opts: { anchor: () => Element | null; mode: "balls" | "glyph"; order?: number; light?: number; seed?: number }) {
    this.getAnchor = opts.anchor;
    this.mode = opts.mode === "balls" ? 0 : 1;
    this.order = opts.order ?? 0;
    this.light = opts.light ?? 0;
    this.uBalls = Array.from({ length: 9 }, () => new THREE.Vector4());

    const seed = opts.seed ?? 1;
    const rand = mulberry32(seed);
    const radii = [0.82, 0.62, 0.52, 0.44, 0.36, 0.3, 0.24, 0.18];
    this.balls = radii.map((r, i) => ({
      r,
      R: i === 0 ? 0.22 : 0.62 + rand() * 0.55 + i * 0.03,
      a: 0.25 + rand() * 0.35,
      b: 0.2 + rand() * 0.35,
      c: 0.2 + rand() * 0.3,
      p: rand() * Math.PI * 2,
      q: rand() * Math.PI * 2,
      s: rand() * Math.PI * 2,
    }));

    const acc = accentRGB();
    this.material = new THREE.ShaderMaterial({
      vertexShader: chromeVertex,
      fragmentShader: chromeFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uFov: { value: (32 * Math.PI) / 180 },
        uCamZ: { value: 7 },
        uMode: { value: this.mode },
        uBalls: { value: this.uBalls },
        uCount: { value: 0 },
        uK: { value: 0.55 },
        uW: { value: this.weights },
        uRot: { value: new THREE.Matrix3() },
        uPos: { value: new THREE.Vector3() },
        uScale: { value: 1 },
        uWobble: { value: 0 },
        uAcc: { value: new THREE.Vector3(...acc.map((c) => Math.pow(c, 2.2))) },
        uLight: { value: this.light },
        uBound: { value: new THREE.Vector4(0, 0, 0, 2) },
        uAlpha: { value: 1 },
        uEnvRot: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(fullscreenTriangle(), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  /** Empurrão nas esferas (clique). */
  pulse(amount = 1) {
    this.impulse += amount;
  }

  rect(): Rect | null {
    if (!this.enabled || this.alpha <= 0.001 || this.appear <= 0.001) return null;
    const el = this.getAnchor();
    if (!el || !isNear(el)) return null;
    const b = el.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  }

  render(renderer: THREE.WebGLRenderer, rect: Rect, dt: number, time: number) {
    const u = this.material.uniforms;
    const dpr = renderer.getPixelRatio();
    u.uRes.value.set(rect.w * dpr, rect.h * dpr);
    u.uTime.value = time;
    u.uLight.value = this.light;
    u.uAlpha.value = this.alpha;
    u.uEnvRot.value = time * 0.06 + this.progress * 0.8;

    const camZ = u.uCamZ.value as number;
    const halfH = camZ * Math.tan(u.uFov.value / 2);
    const aspect = rect.w / rect.h;
    const halfW = halfH * aspect;

    // ponteiro em coordenadas do mundo (plano z = 0) relativo a esta vista
    const lx = ((pointer.x - rect.x) / rect.w) * 2 - 1;
    const ly = -(((pointer.y - rect.y) / rect.h) * 2 - 1);
    const inside = pointer.active && lx > -1.2 && lx < 1.2 && ly > -1.2 && ly < 1.2;

    const cx = this.center.x * halfW;
    const cy = this.center.y * halfH;
    // em vistas estreitas (celular) a escala segue a largura para o objeto não vazar
    const unit = this.size * Math.min(halfH, halfW * 1.1);

    if (this.mode === 0) this.updateBalls(dt, time, lx * halfW, ly * halfH, inside, cx, cy, unit, Math.min(1, aspect * 1.5));
    else this.updateGlyph(dt, time, lx, ly, inside, cx, cy, unit);

    renderer.render(this.scene, this.camera);
  }

  private updateBalls(dt: number, time: number, wx: number, wy: number, inside: boolean, cx: number, cy: number, unit: number, squeeze: number) {
    const u = this.material.uniforms;
    this.impulse *= Math.exp(-dt * 2.2);
    const spread = (1 + this.scatter + this.impulse * 0.9 + this.progress * 0.35) * unit;
    const grow = this.appear;
    const melt = this.progress;
    const t = time;

    let maxR = 0;
    let n = 0;
    for (let i = 0; i < this.balls.length; i++) {
      const b = this.balls[i];
      const x = Math.sin(t * b.a + b.p) * b.R;
      const y = Math.cos(t * b.b + b.q) * b.R * 0.78;
      const z = Math.sin(t * b.c + b.s) * b.R * 0.6;
      // gira o conjunto com a rolagem
      const ang = melt * 1.4;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const X = x * ca - z * sa;
      const Z = x * sa + z * ca;
      const r = b.r * unit * grow * (1 - melt * 0.25);
      const v = this.uBalls[n++];
      v.set(cx + X * spread * squeeze, cy + y * spread + melt * unit * 0.6, Z * spread, r);
      maxR = Math.max(maxR, Math.hypot(v.x - cx, v.y - cy, v.z) + r);
    }

    // esfera que segue o cursor
    if (this.followPointer && !isTouch()) {
      const tx = inside ? wx : cx + Math.sin(t * 0.5) * unit * 1.2;
      const ty = inside ? wy : cy + Math.cos(t * 0.4) * unit * 0.6;
      const tz = inside ? 0.9 * unit : 0;
      // mola criticamente amortecida
      const k = 38, damp = 2 * Math.sqrt(k) * 0.9;
      this.pointerVel.x += ((tx - this.pointerBall.x) * k - this.pointerVel.x * damp) * dt;
      this.pointerVel.y += ((ty - this.pointerBall.y) * k - this.pointerVel.y * damp) * dt;
      this.pointerVel.z += ((tz - this.pointerBall.z) * k - this.pointerVel.z * damp) * dt;
      this.pointerBall.addScaledVector(this.pointerVel, dt);
      const r = 0.36 * unit * grow;
      const v = this.uBalls[n++];
      v.set(this.pointerBall.x, this.pointerBall.y, this.pointerBall.z, r);
      maxR = Math.max(maxR, Math.hypot(v.x - cx, v.y - cy, v.z) + r);
    }

    u.uCount.value = n;
    u.uK.value = unit * (0.5 + melt * 0.3);
    u.uBound.value.set(cx, cy, 0, maxR + u.uK.value * 0.35 + 0.05);
  }

  private updateGlyph(dt: number, time: number, lx: number, ly: number, inside: boolean, cx: number, cy: number, unit: number) {
    const u = this.material.uniforms;
    const tx = inside ? -ly * 0.35 : Math.sin(time * 0.5) * 0.12;
    const ty = inside ? lx * 0.55 : Math.sin(time * 0.35) * 0.5;
    const e = 1 - Math.exp(-dt * 4);
    this.rot.x += (tx - this.rot.x) * e;
    this.rot.y += (ty - this.rot.y) * e;

    tmpE.set(this.rot.x + Math.sin(time * 0.7) * 0.05, this.rot.y + Math.sin(time * 0.3) * 0.25, Math.sin(time * 0.45) * 0.04);
    tmpM4.makeRotationFromEuler(tmpE).invert();
    tmpM3.setFromMatrix4(tmpM4);
    u.uRot.value.copy(tmpM3);

    const s = unit * (0.6 + 0.4 * this.appear);
    u.uScale.value = s;
    u.uPos.value.set(cx, cy + Math.sin(time * 1.1) * unit * 0.04, 0);
    u.uWobble.value = this.wobble;
    u.uBound.value.set(cx, cy, 0, s * 1.55);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
