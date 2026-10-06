import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis, lockScroll } from "@/lib/scroll";
import { registerPortal } from "@/lib/portal";
import { accentRGB } from "@/lib/accent";
import { hasWebGL, reducedMotion } from "@/lib/env";
import { Monogram } from "./Monogram";

/**
 * Transição de portal para saltos longos na mesma página (ex.: voltar ao topo).
 *  1. Mergulho: um disco grafite nasce no ponto do clique, com borda líquida e fio de luz
 *     na cor de acento, e cobre a tela.
 *  2. Dentro: fluxo prateado lento e o monograma girando.
 *  3. A página salta para o destino por baixo.
 *  4. Emersão: um portal se abre do centro e revela a página.
 * O WebGL só é criado no primeiro uso e só desenha durante a transição.
 */

const vert = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform vec2 uOrigin;
uniform float uIn;
uniform float uOut;
uniform float uInR;
uniform float uOutR;
uniform float uTime;
uniform vec3 uAcc;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// círculo com a borda ondulada por ruído: redondo no começo, líquido conforme cresce
float liquid(vec2 p, vec2 c, float t, float r) {
  vec2 d = p - c;
  float len = length(d);
  vec2 dir = d / max(len, 1e-4);
  float wob = (fbm(dir * 1.3 + vec2(t * 0.35, -t * 0.25)) - 0.5) * 0.16 + (noise(dir * 3.5 + t * 0.6) - 0.5) * 0.03;
  return len - r - wob * clamp(r * 1.6, 0.0, 1.0);
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime;

  float dIn = liquid(p, vec2(uOrigin.x * aspect, uOrigin.y), t, uIn * uInR);
  float coverIn = 1.0 - smoothstep(-0.002, 0.002, dIn);
  float opening = step(0.0001, uOut);
  float dOut = 1.0;
  float hole = 0.0;
  if (opening > 0.5) {
    dOut = liquid(p, vec2(0.5 * aspect, 0.5), t + 4.0, uOut * uOutR);
    hole = 1.0 - smoothstep(-0.002, 0.002, dOut);
  }
  float cover = coverIn * (1.0 - hole);

  vec3 base = vec3(0.04, 0.042, 0.048);
  if (cover > 0.0) {
    vec2 q = p * 2.4 + vec2(t * 0.06, -t * 0.04);
    float flow = fbm(q + vec2(sin(q.y * 1.3 + t * 0.4), cos(q.x * 1.1 - t * 0.3)) * 0.6);
    base += vec3(0.85, 0.86, 0.9) * smoothstep(0.6, 0.95, flow) * 0.055;
  }
  base *= mix(0.7, 1.0, smoothstep(1.25, 0.2, length(vUv - 0.5) * 1.6));

  float edgeD = opening > 0.5 ? dOut : dIn;
  float prog = opening > 0.5 ? uOut : uIn;
  float active = step(0.0001, prog) * (1.0 - step(0.9999, prog));
  float rim = exp(-abs(edgeD) * 420.0);
  float glow = exp(-abs(edgeD) * 55.0) * 0.18;
  vec3 fringe = vec3(exp(-abs(edgeD - 0.004) * 380.0), exp(-abs(edgeD) * 380.0), exp(-abs(edgeD + 0.004) * 380.0));
  vec3 rimCol = uAcc * (rim + glow) + fringe * 0.3;

  vec3 col = base * cover + rimCol * active;
  float alpha = clamp(cover + (rim + glow) * active, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

/** Fração da resolução em que o portal é desenhado (a borda líquida aguenta bem). */
const RENDER_SCALE = 0.65;

/** Espera o destino assentar (4 quadros rápidos seguidos, no máximo 1,3 s) antes de abrir. */
function settle(done: () => void) {
  const start = performance.now();
  let last = start;
  let ok = 0;
  const step = (t: number) => {
    ok = t - last < 24 ? ok + 1 : 0;
    last = t;
    if (ok >= 4 || t - start > 1300) done();
    else requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

type GL = {
  ctx: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  loc: Record<string, WebGLUniformLocation | null>;
};

function compile(ctx: WebGLRenderingContext, type: number, src: string) {
  const s = ctx.createShader(type)!;
  ctx.shaderSource(s, src);
  ctx.compileShader(s);
  return s;
}

export function PortalTransition() {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion() || !hasWebGL()) return;
    let gl: GL | null = null;
    let busy = false;
    const u = { in: 0, out: 0, r1: 1, r2: 1, ox: 0.5, oy: 0.5 };

    const ensure = () => {
      if (gl) return gl;
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "width:100%;height:100%;display:block";
      const ctx = (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false }) as WebGLRenderingContext) ?? null;
      if (!ctx) return null;
      const prog = ctx.createProgram()!;
      ctx.attachShader(prog, compile(ctx, ctx.VERTEX_SHADER, vert));
      ctx.attachShader(prog, compile(ctx, ctx.FRAGMENT_SHADER, frag));
      ctx.linkProgram(prog);
      ctx.useProgram(prog);
      const buf = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
      const pos = ctx.getAttribLocation(prog, "position");
      ctx.enableVertexAttribArray(pos);
      ctx.vertexAttribPointer(pos, 2, ctx.FLOAT, false, 0, 0);
      ctx.clearColor(0, 0, 0, 0);
      const names = ["uRes", "uOrigin", "uIn", "uOut", "uInR", "uOutR", "uTime", "uAcc"];
      const loc: GL["loc"] = {};
      names.forEach((n) => (loc[n] = ctx.getUniformLocation(prog, n)));
      host.current!.appendChild(canvas);
      gl = { ctx, canvas, loc };
      return gl;
    };

    const resize = () => {
      if (!gl) return;
      const w = Math.round(window.innerWidth * RENDER_SCALE);
      const h = Math.round(window.innerHeight * RENDER_SCALE);
      gl.canvas.width = w;
      gl.canvas.height = h;
      gl.ctx.viewport(0, 0, w, h);
    };

    const draw = (time: number) => {
      if (!gl) return;
      const { ctx, loc } = gl;
      const acc = accentRGB();
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.uniform2f(loc.uRes, window.innerWidth, window.innerHeight);
      ctx.uniform2f(loc.uOrigin, u.ox, u.oy);
      ctx.uniform1f(loc.uIn, u.in);
      ctx.uniform1f(loc.uOut, u.out);
      ctx.uniform1f(loc.uInR, u.r1);
      ctx.uniform1f(loc.uOutR, u.r2);
      ctx.uniform1f(loc.uTime, time);
      ctx.uniform3f(loc.uAcc, acc[0], acc[1], acc[2]);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    };

    const farthest = (ox: number, oy: number, aspect: number) =>
      Math.max(...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => Math.hypot((x - ox) * aspect, y - oy))) + 0.18;

    const ticker = (time: number) => draw(time);

    const hide = () => {
      busy = false;
      gsap.ticker.remove(ticker);
      gsap.set(root.current, { autoAlpha: 0, pointerEvents: "none" });
      lockScroll(false);
    };

    registerPortal((y, origin) => {
      // perto do destino a rolagem normal basta
      if (Math.abs(y - window.scrollY) < window.innerHeight * 0.9) return false;
      if (busy) return true;
      if (!ensure()) return false;
      busy = true;
      resize();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;
      u.ox = (origin?.x ?? w / 2) / w;
      u.oy = 1 - (origin?.y ?? h / 2) / h;
      u.r1 = farthest(u.ox, u.oy, aspect);
      u.r2 = farthest(0.5, 0.5, aspect);
      u.in = 0;
      u.out = 0;
      lockScroll(true);
      gsap.ticker.add(ticker);

      const tl = gsap
        .timeline({ onComplete: hide })
        .set(root.current, { autoAlpha: 1, pointerEvents: "auto" })
        .to(u, { in: 1, duration: 0.85, ease: "power3.inOut" }, 0)
        .fromTo(core.current, { autoAlpha: 0, scale: 0.6, rotate: -20 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.6, ease: "back.out(1.6)" }, 0.6)
        // salto por baixo; a emersão espera a página assentar
        .add(() => {
          getLenis()?.scrollTo(y, { immediate: true, force: true });
          window.scrollTo(0, y);
          ScrollTrigger.update();
          tl.pause();
          settle(() => tl.play());
        }, 0.95)
        .to(core.current, { autoAlpha: 0, scale: 1.25, duration: 0.4, ease: "power2.in" }, 1.05)
        .to(u, { out: 1, duration: 0.95, ease: "power3.inOut" }, 1.15);
      return true;
    });

    window.addEventListener("resize", resize);
    return () => {
      registerPortal(null);
      gsap.ticker.remove(ticker);
      window.removeEventListener("resize", resize);
      if (gl) {
        gl.ctx.getExtension("WEBGL_lose_context")?.loseContext();
        gl.canvas.remove();
      }
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="pointer-events-none invisible fixed inset-0 z-[98] opacity-0">
      <div ref={host} className="absolute inset-0" />
      <div ref={core} className="absolute inset-0 grid place-items-center opacity-0">
        <span className="grid h-[84px] w-[84px] place-items-center rounded-full border border-white/15 bg-ink/60">
          <Monogram className="h-12 w-12" />
        </span>
      </div>
    </div>
  );
}
