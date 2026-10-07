/**
 * Metal líquido em raymarching.
 * - modo 0: metaballs (hero e contato), esferas passadas por uniform e fundidas com smooth-min
 * - modo 1: glifos dos serviços ("</>", cursor e caneta bézier) que se transformam um no outro
 * O reflexo vem de um estúdio procedural (softboxes + horizonte) com uma faixa na cor de acento.
 */

export const chromeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const chromeFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform vec2 uRes;
uniform float uTime;
uniform float uFov;
uniform float uCamZ;
uniform float uMode;
uniform vec4 uBalls[9];
uniform int uCount;
uniform float uK;
uniform vec3 uW;          // pesos dos glifos (código, cursor, caneta)
uniform mat3 uRot;        // rotação inversa do objeto
uniform vec3 uPos;        // posição do objeto (modo glifo)
uniform float uScale;
uniform float uWobble;
uniform vec3 uAcc;
uniform float uLight;     // 0 = estúdio escuro, 1 = estúdio claro
uniform vec4 uBound;      // esfera envolvente (xyz, raio)
uniform float uAlpha;
uniform float uEnvRot;

#define MAX_STEPS 56

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// ---------- metaballs ----------
float sdBalls(vec3 p) {
  float d = 1e5;
  for (int i = 0; i < 9; i++) {
    if (i >= uCount) break;
    vec4 b = uBalls[i];
    d = smin(d, length(p - b.xyz) - b.w, uK);
  }
  // ondulação de líquido
  float w = sin(p.x * 5.0 + uTime * 1.3) * sin(p.y * 4.6 - uTime * 1.1) * sin(p.z * 5.2 + uTime * 0.9);
  return d + w * 0.018;
}

// ---------- glifo 1: </> ----------
float glyphCode(vec3 p) {
  const float r = 0.12;
  float d = sdCapsule(p, vec3(-0.6, 0.5, 0.0), vec3(-1.12, 0.0, 0.0), r);
  d = smin(d, sdCapsule(p, vec3(-1.12, 0.0, 0.0), vec3(-0.6, -0.5, 0.0), r), 0.06);
  float e = sdCapsule(p, vec3(0.6, 0.5, 0.0), vec3(1.12, 0.0, 0.0), r);
  e = smin(e, sdCapsule(p, vec3(1.12, 0.0, 0.0), vec3(0.6, -0.5, 0.0), r), 0.06);
  d = min(d, e);
  d = min(d, sdCapsule(p, vec3(0.22, 0.74, 0.0), vec3(-0.22, -0.74, 0.0), r));
  return d;
}

// ---------- glifo 2: cursor ----------
const vec2 CV[7] = vec2[7](
  vec2(0.0, 0.0), vec2(0.0, -1.0), vec2(0.24, -0.78), vec2(0.42, -1.16),
  vec2(0.58, -1.08), vec2(0.41, -0.71), vec2(0.72, -0.71)
);

float sdCursor2(vec2 p) {
  float d = dot(p - CV[0], p - CV[0]);
  float s = 1.0;
  for (int i = 0, j = 6; i < 7; j = i, i++) {
    vec2 e = CV[j] - CV[i];
    vec2 w = p - CV[i];
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(b, b));
    bvec3 c = bvec3(p.y >= CV[i].y, p.y < CV[j].y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s *= -1.0;
  }
  return s * sqrt(d);
}

float glyphCursor(vec3 p) {
  const float S = 1.42;
  vec2 q = (p.xy + vec2(0.36, -0.6) * S) / S;
  float d2 = sdCursor2(q) * S;
  const float r = 0.07;
  vec2 w = vec2(d2 + r, abs(p.z) - (0.13 - r));
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r;
}

// ---------- glifo 3: formas básicas (círculo, quadrado, triângulo) ----------
float sdTri2(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

float extrude(vec3 p, float d2, float h, float r) {
  vec2 w = vec2(d2 + r, abs(p.z) - (h - r));
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r;
}

float glyphPen(vec3 p) {
  // triângulo em cima, círculo e quadrado embaixo
  float tri = extrude(p, sdTri2(p.xy - vec2(0.0, 0.36), 0.42), 0.13, 0.05);
  float cir = extrude(p, length(p.xy - vec2(-0.52, -0.4)) - 0.36, 0.13, 0.05);
  vec2 qs = abs(p.xy - vec2(0.52, -0.4)) - vec2(0.32);
  float sq = extrude(p, length(max(qs, 0.0)) + min(max(qs.x, qs.y), 0.0) - 0.04, 0.13, 0.05);
  return min(tri, min(cir, sq));
}

float glyph(vec3 p) {
  float d = 0.0;
  if (uW.x > 0.001) d += uW.x * glyphCode(p);
  if (uW.y > 0.001) d += uW.y * glyphCursor(p);
  if (uW.z > 0.001) d += uW.z * glyphPen(p);
  if (uWobble > 0.001) {
    d += sin(p.x * 6.0 + uTime * 3.0) * sin(p.y * 5.0 - uTime * 2.4) * sin(p.z * 6.0) * 0.05 * uWobble;
  }
  return d;
}

float map(vec3 p) {
  if (uMode < 0.5) return sdBalls(p);
  vec3 q = uRot * (p - uPos) / uScale;
  return glyph(q) * uScale;
}

vec3 calcNormal(vec3 p, float eps) {
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * eps) +
    k.yyx * map(p + k.yyx * eps) +
    k.yxy * map(p + k.yxy * eps) +
    k.xxx * map(p + k.xxx * eps)
  );
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 4; i++) {
    float h = 0.02 + 0.08 * float(i);
    float d = map(p + n * h);
    occ += (h - d) * sca;
    sca *= 0.75;
  }
  return clamp(1.0 - 2.2 * occ, 0.0, 1.0);
}

// softbox retangular numa direção L (tamanho em tangente do ângulo)
float softbox(vec3 d, vec3 L, vec2 size, float soft) {
  float w = dot(d, L);
  if (w <= 0.0) return 0.0;
  vec3 up = abs(L.y) > 0.92 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
  vec3 R = normalize(cross(up, L));
  vec3 U = cross(L, R);
  vec2 q = abs(vec2(dot(d, R), dot(d, U)) / w);
  vec2 e = 1.0 - smoothstep(size - soft, size, q);
  return e.x * e.y;
}

vec3 envMap(vec3 d) {
  float c = cos(uEnvRot), s = sin(uEnvRot);
  d = vec3(c * d.x - s * d.z, d.y, s * d.x + c * d.z);
  float y = d.y;

  vec3 dark = mix(vec3(0.03, 0.03, 0.034), vec3(0.30, 0.305, 0.32), smoothstep(-0.02, 0.95, y));
  dark += vec3(0.24) * softbox(d, normalize(vec3(0.0, 0.12, 1.0)), vec2(0.95, 0.45), 0.6);
  dark += vec3(0.5) * softbox(d, vec3(0.0, 1.0, 0.0), vec2(1.1, 1.1), 0.9) * 0.55;
  vec3 light = mix(vec3(0.50, 0.505, 0.515), vec3(0.97, 0.97, 0.965), smoothstep(-0.35, 0.75, y));
  vec3 col = mix(dark, light, uLight);

  // linha do horizonte e chão
  col += vec3(0.75) * exp(-abs(y + 0.02) * 38.0) * (1.0 - uLight * 0.6);
  col *= mix(1.0, mix(0.3, 0.42, uLight), smoothstep(0.0, -0.3, y));

  float key = softbox(d, normalize(vec3(-0.45, 0.8, 0.42)), vec2(0.62, 0.32), 0.18);
  float stripR = softbox(d, normalize(vec3(0.96, 0.08, 0.28)), vec2(0.06, 1.1), 0.04);
  float stripL = softbox(d, normalize(vec3(-0.92, 0.05, -0.38)), vec2(0.045, 0.9), 0.03);
  float rim = softbox(d, normalize(vec3(0.1, 0.42, -1.0)), vec2(1.3, 0.07), 0.05);
  float accent = softbox(d, normalize(vec3(-0.82, -0.22, 0.52)), vec2(0.032, 0.62), 0.025);

  col += vec3(1.0) * key * mix(3.2, 1.2, uLight);
  col += vec3(0.95, 0.97, 1.0) * stripR * 2.4;
  col += vec3(1.0) * stripL * 1.5;
  col += vec3(1.0) * rim * 1.2;
  col += uAcc * accent * mix(2.4, 1.6, uLight);

  // no estúdio claro, "bandeiras" pretas dão contraste ao cromado
  float flag1 = softbox(d, normalize(vec3(0.62, 0.15, 0.78)), vec2(0.22, 1.2), 0.12);
  float flag2 = softbox(d, normalize(vec3(-0.85, 0.3, 0.1)), vec2(0.12, 0.9), 0.1);
  float flag3 = softbox(d, normalize(vec3(0.0, -0.2, 1.0)), vec2(1.4, 0.05), 0.08);
  col *= 1.0 - uLight * (0.92 * flag1 + 0.85 * flag2 + 0.6 * flag3);
  return col;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float aspect = uRes.x / uRes.y;
  float th = tan(uFov * 0.5);
  vec3 ro = vec3(0.0, 0.0, uCamZ);
  vec3 rd = normalize(vec3(uv.x * aspect * th, uv.y * th, -1.0));

  // esfera envolvente: descarta cedo os pixels que não tocam o objeto
  vec3 oc = ro - uBound.xyz;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - uBound.w * uBound.w;
  float h = b * b - c;
  if (h < 0.0) { gl_FragColor = vec4(0.0); return; }
  h = sqrt(h);
  float t = max(-b - h, 0.0);
  float tEnd = -b + h;

  float px = 2.0 * th / uRes.y;
  float mn = 1e9;
  float tmn = t;
  bool hit = false;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < mn) { mn = d; tmn = t; }
    if (d < px * t * 0.35) { hit = true; break; }
    t += d * 0.92;
    if (t > tEnd) break;
  }

  float cover = hit ? 1.0 : 1.0 - smoothstep(0.0, px * tmn * 1.4, mn);
  if (cover <= 0.002) { gl_FragColor = vec4(0.0); return; }

  float tt = hit ? t : tmn;
  vec3 p = ro + rd * tt;
  vec3 n = calcNormal(p, max(0.0008, px * tt * 0.5));
  vec3 r = reflect(rd, n);
  float ndv = max(dot(n, -rd), 0.0);
  float fres = pow(1.0 - ndv, 5.0);

  vec3 col = envMap(r) * mix(0.74, 1.0, fres);
  // segundo "quique" barato para dar corpo ao interior
  col += envMap(reflect(r, n)) * 0.06;
  col *= mix(0.3, 1.0, calcAO(p, n));
  col *= vec3(0.955, 0.97, 1.0);

  // tone map suave + gama
  col = col / (1.0 + col * 0.55);
  col = pow(col, vec3(1.0 / 2.2));

  float a = cover * uAlpha;
  gl_FragColor = vec4(col * a, a);
}
`;
