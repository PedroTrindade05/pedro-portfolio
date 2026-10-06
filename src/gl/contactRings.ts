import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { Scene3D, studioEnv, localPointer } from "./scene3d";
import { type Rect } from "./stage";
import { Borromean } from "./borromean";
import { pointer } from "@/lib/pointer";
import { isMobile, isTouch } from "@/lib/env";

/**
 * Anéis borromeanos da seção de Contato: o mesmo símbolo do hero, menor,
 * girando devagar, inclinando com o cursor e destacando um anel de cada vez.
 * Arrastar gira o conjunto com inércia.
 */
export class ContactRings extends Scene3D {
  private rings!: Borromean;
  private raycaster = new THREE.Raycaster();
  private drag = { active: false, x: 0, y: 0, rx: 0, ry: 0, vx: 0, vy: 0 };
  private auto = 1.2;
  private mouse = new THREE.Vector2();
  private hovered = -1;
  private cycleTimer = 0;
  private cycleIndex = 0;
  private hl = [{ v: 0 }, { v: 0 }, { v: 0 }];

  constructor(anchor: () => Element | null) {
    super(anchor);
    this.camera.fov = 30;
    this.camera.position.set(0, 0, 9.5);
  }

  protected setup(renderer: THREE.WebGLRenderer) {
    this.scene.environment = studioEnv(renderer);
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(-4, 6, 7);
    const rim = new THREE.DirectionalLight(0xe6ecff, 1.4);
    rim.position.set(5, -2, -6);
    this.scene.add(key, rim);
    this.rings = new Borromean(isMobile() ? "low" : "high");
    this.scene.add(this.rings.group);
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
    const s = (0.4 + 0.6 * this.appear) * 0.95;
    this.rings.group.scale.setScalar(s);
    this.rings.group.position.set(0, Math.sin(time * 0.8) * 0.06, 0);

    if (!this.drag.active) {
      this.drag.vx *= 0.94;
      this.drag.vy *= 0.94;
      this.drag.rx += this.drag.vx;
      this.drag.ry += this.drag.vy;
      this.drag.rx *= 0.985;
    }
    this.auto += dt * 0.2;
    const active = pointer.active && !isTouch();
    this.mouse.x += ((active ? pointer.nx : 0) - this.mouse.x) * 0.05;
    this.mouse.y += ((active ? pointer.ny : 0) - this.mouse.y) * 0.05;
    this.rings.spin.rotation.set(
      0.42 + this.mouse.y * 0.3 + this.drag.rx + Math.sin(time * 0.35) * 0.07,
      this.auto + this.drag.ry + (1 - this.appear) * 2.5,
      -this.mouse.x * 0.14 + Math.sin(time * 0.27) * 0.05,
    );

    // mouse num anel destaca; sem mouse, o destaque passa sozinho
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
    }
    for (let k = 0; k < 3; k++) this.rings.highlight[k] = this.hl[k].v;
    this.rings.apply();
  }

  dispose() {
    this.rings?.dispose();
    super.dispose();
  }
}
