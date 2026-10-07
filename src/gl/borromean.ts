import * as THREE from "three";

/**
 * Anéis borromeanos (vindos do portfólio v2): três elipses em planos perpendiculares.
 * Nenhum par está entrelaçado, mas os três juntos não se separam: Trindade =
 * front-end + UI/UX + design gráfico. Cada anel pode ser destacado e todos podem se afastar.
 */
class EllipseCurve3 extends THREE.Curve<THREE.Vector3> {
  constructor(
    private a: number,
    private b: number,
    private plane: number,
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const ang = t * Math.PI * 2;
    const u = this.a * Math.cos(ang);
    const v = this.b * Math.sin(ang);
    if (this.plane === 0) return target.set(u, v, 0);
    if (this.plane === 1) return target.set(0, u, v);
    return target.set(v, 0, u);
  }
}

/** Direção em que cada anel se afasta quando os três se soltam. */
const AXES = [new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)];
/** Direção de onde cada anel voa na entrada: de frente, da esquerda, de cima. */
const FLY = [new THREE.Vector3(0.35, 0.2, 1), new THREE.Vector3(-1, -0.15, 0.2), new THREE.Vector3(0.25, 1, -0.2)].map((v) => v.normalize());
const qSpin = new THREE.Quaternion();
// metal escuro (grafite escovado); o anel em destaque clareia para aço
const BASE = new THREE.Color("#5b5f66");
const LIT = new THREE.Color("#b9bdc4");
const DIM = new THREE.Color("#2b2d31");

export class Borromean {
  group = new THREE.Group();
  spin = new THREE.Group();
  holders: THREE.Group[] = [];
  proxies: THREE.Mesh[] = [];
  materials: THREE.MeshPhysicalMaterial[] = [];
  /** destaque de cada anel (0..1), animado de fora */
  highlight = [0, 0, 0];
  /** quanto os anéis sem destaque escurecem (0..1) */
  focus = 0;
  /** separação dos anéis */
  spread = 0;
  /** entrada de cada anel (0 = longe e girando, 1 = no lugar) */
  enter = [1, 1, 1];

  constructor(quality: "high" | "low" = "high") {
    const a = 1.62, b = 1.0, r = 0.13;
    const tubular = quality === "high" ? 260 : 150;
    const radial = quality === "high" ? 32 : 16;
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
    for (let i = 0; i < 3; i++) {
      const curve = new EllipseCurve3(a, b, i);
      const mat = new THREE.MeshPhysicalMaterial({
        color: BASE.clone(),
        metalness: 1,
        roughness: 0.24,
        clearcoat: 0.6,
        clearcoatRoughness: 0.18,
        envMapIntensity: 1.15,
        emissive: new THREE.Color(0),
      });
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, tubular, r, radial, true), mat);
      const proxy = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, r * 2.4, 8, true), proxyMat);
      proxy.userData.ring = i;
      const holder = new THREE.Group();
      holder.add(mesh, proxy);
      this.spin.add(holder);
      this.holders.push(holder);
      this.proxies.push(proxy);
      this.materials.push(mat);
    }
    this.group.add(this.spin);
  }

  /** Aplica destaque, foco e separação (chamar por quadro). */
  apply() {
    const dirs = [1, -1, 1];
    const spread = this.spread * 1.25;
    for (let k = 0; k < 3; k++) {
      const away = 1 - this.enter[k];
      this.holders[k].position.copy(AXES[k]).multiplyScalar(spread * dirs[k]).addScaledVector(FLY[k], away * 10);
      // gira no próprio plano enquanto chega, desacelerando
      this.holders[k].quaternion.copy(qSpin.setFromAxisAngle(AXES[k], away * away * Math.PI * 2.4 * (k % 2 ? -1 : 1)));
      const h = this.highlight[k];
      const m = this.materials[k];
      m.color.copy(BASE).lerp(DIM, this.focus * (1 - h) * 0.8).lerp(LIT, h * 0.75);
      m.roughness = 0.24 - h * 0.1;
      m.envMapIntensity = 1.15 + h * 0.5;
    }
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
    });
    this.materials.forEach((m) => m.dispose());
  }
}
