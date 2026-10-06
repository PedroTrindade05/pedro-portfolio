import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { Scene3D, studioEnv, localPointer } from "./scene3d";
import { type Rect } from "./stage";
import { Borromean } from "./borromean";
import { pointer } from "@/lib/pointer";
import { isMobile, isTouch } from "@/lib/env";

/**
 * Hero "Trindade": os anéis borromeanos em metal escuro sobre um palco de estúdio.
 * Um chão brilhante reflete os anéis, uma poça de luz no chão segue o cursor,
 * uma grade fina em perspectiva some antes do texto e, de tempos em tempos,
 * um pulso circular sai de baixo dos anéis. O destaque passa de anel em anel
 * (sincronizado com a lista de disciplinas) e o mouse por cima de um anel o destaca.
 */

const floorVert = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const floorFrag = /* glsl */ `
precision highp float;
uniform vec3 uCenter;   // centro dos anéis no chão (x, z) + y do chão
uniform vec2 uLight;    // poça de luz (x, z), segue o cursor
uniform float uTime;
uniform float uAppear;
uniform vec4 uVP;
uniform float uSideFade;
varying vec3 vWorld;

void main() {
  vec2 sp = (gl_FragCoord.xy - uVP.xy) / uVP.zw;
  vec2 p = vWorld.xz;
  float dC = distance(p, uCenter.xy);
  float dL = distance(p, uLight);

  // poça de luz sob os anéis e outra mais suave seguindo o cursor
  float pool = exp(-dC * dC * 0.09) * 0.22 + exp(-dL * dL * 0.06) * 0.12;

  // grade fina que some com a distância
  vec2 g = abs(fract(p * 0.5) - 0.5) / fwidth(p * 0.5);
  float grid = (1.0 - min(min(g.x, g.y), 1.0)) * 0.05 * exp(-dC * 0.12);

  // pulso circular saindo de baixo dos anéis a cada 4 s
  float t = mod(uTime, 4.0);
  float front = t * 3.2;
  float pulse = exp(-pow(dC - front, 2.0) * 4.0) * (1.0 - t / 4.0) * 0.16;

  float light = (pool + grid + pulse) * uAppear;
  // horizonte: some ao longe; do lado do texto, some também
  light *= smoothstep(26.0, 6.0, dC);
  light *= mix(1.0, smoothstep(0.32, 0.6, sp.x), uSideFade);
  vec3 col = vec3(0.86, 0.88, 0.92) * light;
  gl_FragColor = vec4(col, light);
}
`;

export class TrindadeScene extends Scene3D {
  private rings!: Borromean;
  private mirror = new THREE.Group();
  private mirrorMeshes: THREE.Mesh[] = [];
  private floor!: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private raycaster = new THREE.Raycaster();
  private drag = { active: false, x: 0, y: 0, rx: 0, ry: 0, vx: 0, vy: 0 };
  private auto = 0.6;
  private mouse = new THREE.Vector2();
  private light = new THREE.Vector2();
  private hovered = -1;
  private cycleTimer = 0;
  private cycleIndex = 0;
  private hl = [{ v: 0 }, { v: 0 }, { v: 0 }];
  onHover: ((i: number) => void) | null = null;

  constructor(anchor: () => Element | null) {
    super(anchor);
    this.camera.fov = 30;
    this.camera.position.set(0, 1.6, 12);
  }

  protected setup(renderer: THREE.WebGLRenderer) {
    this.scene.environment = studioEnv(renderer);
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(-4, 7, 6);
    const rim = new THREE.DirectionalLight(0xe6ecff, 1.4);
    rim.position.set(5, 2, -6);
    this.scene.add(key, rim);

    this.rings = new Borromean(isMobile() ? "low" : "high");
    this.scene.add(this.rings.group);

    // reflexo: os mesmos anéis espelhados abaixo do chão, bem mais fracos
    this.rings.spin.children.forEach((holder) => {
      const src = holder.children[0] as THREE.Mesh;
      const mat = (src.material as THREE.MeshPhysicalMaterial).clone();
      mat.transparent = true;
      mat.opacity = 0.2;
      mat.depthWrite = false;
      const m = new THREE.Mesh(src.geometry, mat);
      const h = new THREE.Group();
      h.add(m);
      this.mirror.add(h);
      this.mirrorMeshes.push(m);
    });
    this.scene.add(this.mirror);

    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.ShaderMaterial({
        vertexShader: floorVert,
        fragmentShader: floorFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uCenter: { value: new THREE.Vector3() },
          uLight: { value: new THREE.Vector2() },
          uTime: { value: 0 },
          uAppear: { value: 0 },
          uVP: { value: this.vp },
          uSideFade: { value: 1 },
        },
      }),
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.frustumCulled = false;
    this.scene.add(this.floor);
  }

  pointerDown(x: number, y: number) {
    this.drag = { ...this.drag, active: true, x, y };
  }
  pointerMove(x: number, y: number) {
    if (!this.drag.active) return;
    this.drag.vy = (x - this.drag.x) * 0.006;
    this.drag.vx = (y - this.drag.y) * 0.004;
    this.drag.ry += this.drag.vy;
    this.drag.rx += this.drag.vx;
    this.drag.x = x;
    this.drag.y = y;
  }
  pointerUp() {
    this.drag.active = false;
  }

  private setHighlight(i: number) {
    this.hl.forEach((h, k) => gsap.to(h, { v: k === i ? 1 : 0, duration: 0.6, ease: "power2.out", overwrite: true }));
    gsap.to(this.rings, { focus: i >= 0 ? 1 : 0, duration: 0.6, ease: "power2.out" });
  }

  protected update(dt: number, time: number, rect: Rect) {
    const mobile = rect.w < 768;
    const halfH = this.camera.position.z * Math.tan((this.camera.fov * Math.PI) / 360);
    const halfW = halfH * (rect.w / rect.h);

    // anéis à direita no desktop, no alto no celular
    const base = mobile ? 0.78 : 1.1;
    const s = base * (0.35 + 0.65 * this.appear) * (1 + this.progress * 0.4);
    const gx = mobile ? 0 : halfW * 0.4;
    const gy = (mobile ? halfH * 0.42 : 0.55) + this.progress * 2.2 + Math.sin(time * 0.8) * 0.06;
    this.rings.group.scale.setScalar(s);
    this.rings.group.position.set(gx, gy, 0);

    // chão logo abaixo dos anéis
    const floorY = (mobile ? halfH * 0.42 : 0.55) - 1.78 * base * (1 + this.progress * 0.4);
    this.floor.position.y = floorY;
    const fu = this.floor.material.uniforms;
    fu.uTime.value = time;
    fu.uAppear.value = this.appear;
    fu.uCenter.value.set(gx, 0, floorY);
    fu.uSideFade.value = mobile ? 0 : 1;

    // giro: automático + arraste com inércia + inclinação pelo cursor
    if (!this.drag.active) {
      this.drag.vx *= 0.94;
      this.drag.vy *= 0.94;
      this.drag.rx += this.drag.vx;
      this.drag.ry += this.drag.vy;
      this.drag.rx *= 0.985;
    }
    this.auto += dt * (0.22 + (this.hovered >= 0 ? -0.08 : 0));
    const active = pointer.active && !isTouch();
    this.mouse.x += ((active ? pointer.nx : 0) - this.mouse.x) * 0.05;
    this.mouse.y += ((active ? pointer.ny : 0) - this.mouse.y) * 0.05;
    this.rings.spin.rotation.set(
      0.42 + this.mouse.y * 0.3 + this.drag.rx + Math.sin(time * 0.35) * 0.07,
      this.auto + this.drag.ry + (1 - this.appear) * 2.5,
      -this.mouse.x * 0.14 + Math.sin(time * 0.27) * 0.05,
    );

    // poça de luz no chão persegue o cursor
    const lx = gx + this.mouse.x * halfW * 0.9;
    const lz = -this.mouse.y * 6;
    this.light.x += (lx - this.light.x) * 0.06;
    this.light.y += (lz - this.light.y) * 0.06;
    fu.uLight.value.copy(this.light);

    // hover: qual anel está sob o cursor; sem hover, o destaque passa sozinho
    let hit = -1;
    if (active && !this.drag.active && this.appear > 0.9) {
      const p = localPointer(pointer.x, pointer.y, rect);
      if (Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1) {
        this.raycaster.setFromCamera(new THREE.Vector2(p.x, p.y), this.camera);
        const hits = this.raycaster.intersectObjects(this.rings.proxies, false);
        if (hits.length) hit = hits[0].object.userData.ring as number;
      }
    }
    if (hit < 0) {
      this.cycleTimer += dt;
      if (this.cycleTimer > 2.8) {
        this.cycleTimer = 0;
        this.cycleIndex = (this.cycleIndex + 1) % 3;
      }
      hit = this.appear > 0.9 ? this.cycleIndex : -1;
    }
    if (hit !== this.hovered) {
      this.hovered = hit;
      this.setHighlight(hit);
      this.onHover?.(hit);
    }
    for (let k = 0; k < 3; k++) this.rings.highlight[k] = this.hl[k].v;
    this.rings.apply();

    // espelho: mesma pose, invertida em relação ao chão, com o material sincronizado
    this.mirror.position.set(gx, 2 * floorY - gy, 0);
    this.mirror.scale.set(s, -s, s);
    this.mirror.rotation.copy(this.rings.spin.rotation);
    this.mirrorMeshes.forEach((m, k) => {
      const src = this.rings.materials[k];
      const dst = m.material as THREE.MeshPhysicalMaterial;
      dst.color.copy(src.color);
      dst.roughness = src.roughness;
      dst.envMapIntensity = src.envMapIntensity;
      dst.opacity = 0.2 * this.appear;
    });

    this.camera.lookAt(mobile ? 0 : halfW * 0.08, 0.2, 0);
  }

  dispose() {
    this.rings?.dispose();
    this.mirrorMeshes.forEach((m) => (m.material as THREE.Material).dispose());
    super.dispose();
  }
}
