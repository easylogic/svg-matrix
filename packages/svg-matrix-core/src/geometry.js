const EPSILON = 1e-10;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function scale(v, factor) {
  return { x: v.x * factor, y: v.y * factor };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function length(v) {
  return Math.hypot(v.x, v.y);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerpPoint(a, b, t) {
  return add(scale(a, 1 - t), scale(b, t));
}

/** 4·(√2−1)/3 — quarter-circle cubic approximation constant */
export const CIRCLE_CUBIC_KAPPA = (4 * (Math.SQRT2 - 1)) / 3;

export function subdivideCubicBezier(p0, p1, p2, p3) {
  const m01 = lerpPoint(p0, p1, 0.5);
  const m12 = lerpPoint(p1, p2, 0.5);
  const m23 = lerpPoint(p2, p3, 0.5);
  const m012 = lerpPoint(m01, m12, 0.5);
  const m123 = lerpPoint(m12, m23, 0.5);
  const mid = lerpPoint(m012, m123, 0.5);
  return {
    left: { p0, p1: m01, p2: m012, p3: mid },
    right: { p0: mid, p1: m123, p2: m23, p3 }
  };
}

export function subdivideQuadraticBezier(p0, p1, p2) {
  const q01 = lerpPoint(p0, p1, 0.5);
  const q12 = lerpPoint(p1, p2, 0.5);
  const mid = lerpPoint(q01, q12, 0.5);
  return {
    left: { p0, p1: q01, p2: mid },
    right: { p0: mid, p1: q12, p2 }
  };
}

export function cubicFlatnessError(p0, p1, p2, p3) {
  const mid = lerpPoint(lerpPoint(lerpPoint(p0, p1, 0.5), lerpPoint(p1, p2, 0.5), 0.5), lerpPoint(lerpPoint(p1, p2, 0.5), lerpPoint(p2, p3, 0.5), 0.5), 0.5);
  const chord = subtract(p3, p0);
  const chordLen = length(chord);
  if (chordLen < EPSILON) return length(subtract(mid, p0));
  const cross = Math.abs(chord.x * (mid.y - p0.y) - chord.y * (mid.x - p0.x)) / chordLen;
  return cross;
}

export function quadraticFlatnessError(p0, p1, p2) {
  const mid = lerpPoint(lerpPoint(p0, p1, 0.5), lerpPoint(p1, p2, 0.5), 0.5);
  const chord = subtract(p2, p0);
  const chordLen = length(chord);
  if (chordLen < EPSILON) return length(subtract(mid, p0));
  return Math.abs(chord.x * (mid.y - p0.y) - chord.y * (mid.x - p0.x)) / chordLen;
}

function cubicDerivatives(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const d1 = {
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y)
  };
  const d2 = {
    x: 6 * mt * (p2.x - 2 * p1.x + p0.x) + 6 * t * (p3.x - 2 * p2.x + p1.x),
    y: 6 * mt * (p2.y - 2 * p1.y + p0.y) + 6 * t * (p3.y - 2 * p2.y + p1.y)
  };
  return { d1, d2 };
}

export function cubicCurvatureAt(p0, p1, p2, p3, t) {
  const { d1, d2 } = cubicDerivatives(p0, p1, p2, p3, t);
  const cross = d1.x * d2.y - d1.y * d2.x;
  const speed = length(d1);
  if (speed < EPSILON) return 0;
  return cross / (speed * speed * speed);
}

export function cubicNormalAt(p0, p1, p2, p3, t, side = 1) {
  const { d1 } = cubicDerivatives(p0, p1, p2, p3, t);
  const speed = length(d1);
  if (speed < EPSILON) return { x: 0, y: -side };
  const tx = d1.x / speed;
  const ty = d1.y / speed;
  return { x: -ty * side, y: tx * side };
}

export function quadraticCurvatureAt(p0, p1, p2, t) {
  const mt = 1 - t;
  const d1 = {
    x: 2 * mt * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
    y: 2 * mt * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
  };
  const d2 = { x: 2 * (p2.x - 2 * p1.x + p0.x), y: 2 * (p2.y - 2 * p1.y + p0.y) };
  const cross = d1.x * d2.y - d1.y * d2.x;
  const speed = length(d1);
  if (speed < EPSILON) return 0;
  return cross / (speed * speed * speed);
}

export function reflectControlForSmoothContinuation(anchor, previousControl) {
  return subtract(scale(anchor, 2), previousControl);
}

export function shoelaceArea(polygon) {
  let sum = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

export function lineSegmentIntersection(a0, a1, b0, b1) {
  const dax = a1.x - a0.x;
  const day = a1.y - a0.y;
  const dbx = b1.x - b0.x;
  const dby = b1.y - b0.y;
  const denom = dax * dby - day * dbx;
  if (Math.abs(denom) < EPSILON) return null;
  const t = ((b0.x - a0.x) * dby - (b0.y - a0.y) * dbx) / denom;
  const u = ((b0.x - a0.x) * day - (b0.y - a0.y) * dax) / denom;
  if (t < -EPSILON || t > 1 + EPSILON || u < -EPSILON || u > 1 + EPSILON) return null;
  return { point: { x: a0.x + t * dax, y: a0.y + t * day }, t, u };
}

function cubicAt(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
  };
}

function quadraticAt(p0, p1, p2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
  };
}

function distancePointToLine(point, l0, l1) {
  const line = subtract(l1, l0);
  const len = length(line);
  if (len < EPSILON) return length(subtract(point, l0));
  const cross = Math.abs(line.x * (point.y - l0.y) - line.y * (point.x - l0.x));
  return cross / len;
}

function refineCubicLineHit(p0, p1, p2, p3, l0, l1, t0, t1) {
  for (let i = 0; i < 10; i += 1) {
    const tm = (t0 + t1) / 2;
    const dm = distancePointToLine(cubicAt(p0, p1, p2, p3, tm), l0, l1);
    const d0 = distancePointToLine(cubicAt(p0, p1, p2, p3, t0), l0, l1);
    if (d0 * dm <= 0) t1 = tm;
    else t0 = tm;
  }
  const t = (t0 + t1) / 2;
  return { t, point: cubicAt(p0, p1, p2, p3, t) };
}

export function lineCubicIntersections(p0, p1, p2, p3, l0, l1) {
  const tol = 0.75;
  const steps = 48;
  const hits = [];
  let prevT = 0;
  let prevD = distancePointToLine(cubicAt(p0, p1, p2, p3, 0), l0, l1);
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const nextD = distancePointToLine(cubicAt(p0, p1, p2, p3, t), l0, l1);
    if (prevD <= tol && nextD <= tol) {
      hits.push(refineCubicLineHit(p0, p1, p2, p3, l0, l1, prevT, t));
    } else if (prevD > tol && nextD <= tol) {
      hits.push(refineCubicLineHit(p0, p1, p2, p3, l0, l1, prevT, t));
    } else if (prevD <= tol && nextD > tol) {
      hits.push(refineCubicLineHit(p0, p1, p2, p3, l0, l1, prevT, t));
    }
    prevT = t;
    prevD = nextD;
  }
  const unique = [];
  for (const hit of hits) {
    if (!unique.length || Math.abs(hit.t - unique[unique.length - 1].t) > 0.05) unique.push(hit);
  }
  return unique;
}

export function lineQuadraticIntersections(p0, p1, p2, l0, l1) {
  const hits = [];
  const steps = 64;
  let prev = distancePointToLine(quadraticAt(p0, p1, p2, 0), l0, l1);
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const next = distancePointToLine(quadraticAt(p0, p1, p2, t), l0, l1);
    if (prev <= 0.5 && next <= 0.5) hits.push({ t, point: quadraticAt(p0, p1, p2, t) });
    prev = next;
  }
  return hits;
}

function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function closestPointOnCubic(point, p0, p1, p2, p3, options = {}) {
  const samples = options.samples ?? 32;
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const d = distanceSquared(point, cubicAt(p0, p1, p2, p3, t));
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  for (let step = 0; step < 8; step += 1) {
    const span = 1 / (samples * 2 ** step);
    for (const t of [bestT - span, bestT + span]) {
      const clamped = clamp(t, 0, 1);
      const d = distanceSquared(point, cubicAt(p0, p1, p2, p3, clamped));
      if (d < bestD) {
        bestD = d;
        bestT = clamped;
      }
    }
  }
  const pt = cubicAt(p0, p1, p2, p3, bestT);
  return { t: bestT, point: pt, distance: Math.sqrt(bestD) };
}

export function closestPointOnQuadratic(point, p0, p1, p2, options = {}) {
  const samples = options.samples ?? 24;
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const d = distanceSquared(point, quadraticAt(p0, p1, p2, t));
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  const pt = quadraticAt(p0, p1, p2, bestT);
  return { t: bestT, point: pt, distance: Math.sqrt(bestD) };
}

export function offsetPointOnCubic(p0, p1, p2, p3, t, distance) {
  const point = cubicAt(p0, p1, p2, p3, t);
  const normal = cubicNormalAt(p0, p1, p2, p3, t, 1);
  return add(point, scale(normal, distance));
}

export function unitCircleQuarterCubics() {
  const k = CIRCLE_CUBIC_KAPPA;
  return [
    { p0: { x: 1, y: 0 }, p1: { x: 1, y: k }, p2: { x: k, y: 1 }, p3: { x: 0, y: 1 } }
  ];
}

export function invertAffineMatrix(matrix) {
  const { a, b, c, d, e, f } = matrix;
  const det = a * d - b * c;
  if (Math.abs(det) < EPSILON) throw new Error("Singular affine matrix");
  const invDet = 1 / det;
  return {
    a: d * invDet,
    b: -b * invDet,
    c: -c * invDet,
    d: a * invDet,
    e: (c * f - d * e) * invDet,
    f: (b * e - a * f) * invDet
  };
}

export function applyAffineMatrix(matrix, point) {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f
  };
}

export function decomposeAffineMatrix(matrix) {
  const { a, b, c, d, e, f } = matrix;
  const translate = { x: e, y: f };
  const scaleX = Math.hypot(a, b);
  const rotation = Math.atan2(b, a);
  const det = a * d - b * c;
  const scaleY = det / scaleX;
  const shear = Math.atan2(a * c + b * d, scaleX * scaleX);
  return { translate, rotation, scaleX, scaleY, shear, matrix };
}

export function transformPathSegments(segments, matrix) {
  const mapPoint = (p) => applyAffineMatrix(matrix, p);
  return segments.map((segment) => {
    if (segment.type === "M") return { type: "M", point: mapPoint(segment.point) };
    if (segment.type === "L") {
      return { type: "L", from: mapPoint(segment.from), to: mapPoint(segment.to) };
    }
    if (segment.type === "C") {
      return {
        type: "C",
        from: mapPoint(segment.from),
        cp1: mapPoint(segment.cp1),
        cp2: mapPoint(segment.cp2),
        to: mapPoint(segment.to)
      };
    }
    if (segment.type === "Q") {
      return { type: "Q", from: mapPoint(segment.from), cp: mapPoint(segment.cp), to: mapPoint(segment.to) };
    }
    return { ...segment, from: mapPoint(segment.from), to: mapPoint(segment.to) };
  });
}

export function premultiplyColor(color) {
  return { ...color, r: color.r * color.a, g: color.g * color.a, b: color.b * color.a, a: color.a };
}

export function unpremultiplyColor(color) {
  if (color.a < EPSILON) return { ...color, r: 0, g: 0, b: 0 };
  return { r: color.r / color.a, g: color.g / color.a, b: color.b / color.a, a: color.a };
}

export function porterDuffSourceOver(source, backdrop) {
  const outA = source.a + backdrop.a * (1 - source.a);
  if (outA < EPSILON) return { r: 0, g: 0, b: 0, a: 0 };
  const r = (source.r * source.a + backdrop.r * backdrop.a * (1 - source.a)) / outA;
  const g = (source.g * source.a + backdrop.g * backdrop.a * (1 - source.a)) / outA;
  const b = (source.b * source.a + backdrop.b * backdrop.a * (1 - source.a)) / outA;
  return { r, g, b, a: outA };
}

export function gaussianKernel1D(sigma, radius = null) {
  const r = radius ?? Math.ceil(sigma * 3);
  const kernel = [];
  let sum = 0;
  for (let i = -r; i <= r; i += 1) {
    const w = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(w);
    sum += w;
  }
  return kernel.map((w) => w / sum);
}

export function convolve1D(signal, kernel) {
  const radius = Math.floor(kernel.length / 2);
  const out = new Array(signal.length);
  for (let i = 0; i < signal.length; i += 1) {
    let sum = 0;
    for (let k = 0; k < kernel.length; k += 1) {
      const idx = clamp(i + k - radius, 0, signal.length - 1);
      sum += signal[idx] * kernel[k];
    }
    out[i] = sum;
  }
  return out;
}

function controlHullBBox(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function bboxOverlaps(a, b) {
  return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
}

function cubicAsSegment(p0, p1, p2, p3) {
  return { p0, p1, p2, p3 };
}

function collectCubicCubicIntersections(a, b, tolerance, depth, out) {
  if (depth > 12) return;
  const boxA = controlHullBBox([a.p0, a.p1, a.p2, a.p3]);
  const boxB = controlHullBBox([b.p0, b.p1, b.p2, b.p3]);
  if (!bboxOverlaps(boxA, boxB)) return;

  const flatA = cubicFlatnessError(a.p0, a.p1, a.p2, a.p3);
  const flatB = cubicFlatnessError(b.p0, b.p1, b.p2, b.p3);
  if (flatA <= tolerance && flatB <= tolerance) {
    const hit = lineSegmentIntersection(a.p0, a.p3, b.p0, b.p3);
    if (hit) {
      out.push({
        point: hit.point,
        tA: hit.t,
        tB: hit.u
      });
    }
    return;
  }

  const splitA = subdivideCubicBezier(a.p0, a.p1, a.p2, a.p3);
  const splitB = subdivideCubicBezier(b.p0, b.p1, b.p2, b.p3);
  const childrenA = [
    cubicAsSegment(splitA.left.p0, splitA.left.p1, splitA.left.p2, splitA.left.p3),
    cubicAsSegment(splitA.right.p0, splitA.right.p1, splitA.right.p2, splitA.right.p3)
  ];
  const childrenB = [
    cubicAsSegment(splitB.left.p0, splitB.left.p1, splitB.left.p2, splitB.left.p3),
    cubicAsSegment(splitB.right.p0, splitB.right.p1, splitB.right.p2, splitB.right.p3)
  ];
  for (const ca of childrenA) {
    for (const cb of childrenB) {
      collectCubicCubicIntersections(ca, cb, tolerance, depth + 1, out);
    }
  }
}

/** Subdivision-based cubic–cubic intersection (approximate t on chord endpoints). */
export function cubicCubicIntersections(p0, p1, p2, p3, q0, q1, q2, q3, options = {}) {
  const tolerance = options.tolerance ?? 0.75;
  const hits = [];
  collectCubicCubicIntersections(
    cubicAsSegment(p0, p1, p2, p3),
    cubicAsSegment(q0, q1, q2, q3),
    tolerance,
    0,
    hits
  );
  const unique = [];
  for (const hit of hits) {
    if (!unique.some((u) => distanceSquared(u.point, hit.point) < 4)) unique.push(hit);
  }
  return unique;
}

function cross2(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function pointInTriangle(p, a, b, c) {
  const c1 = cross2(a, b, p);
  const c2 = cross2(b, c, p);
  const c3 = cross2(c, a, p);
  const hasNeg = c1 < 0 || c2 < 0 || c3 < 0;
  const hasPos = c1 > 0 || c2 > 0 || c3 > 0;
  return !(hasNeg && hasPos);
}

/** Ear clipping for simple polygons (concave OK). Falls back to fan if clipping stalls. */
export function earClipTriangulate(polygon) {
  if (polygon.length < 3) return [];
  if (polygon.length === 3) return [[polygon[0], polygon[1], polygon[2]]];

  const indices = polygon.map((_, index) => index);
  const triangles = [];
  const winding = shoelaceArea(polygon) >= 0 ? 1 : -1;
  let guard = 0;

  while (indices.length > 3 && guard < indices.length * indices.length) {
    guard += 1;
    let clipped = false;
    for (let i = 0; i < indices.length; i += 1) {
      const iPrev = indices[(i - 1 + indices.length) % indices.length];
      const iCurr = indices[i];
      const iNext = indices[(i + 1) % indices.length];
      const a = polygon[iPrev];
      const b = polygon[iCurr];
      const c = polygon[iNext];
      if (cross2(a, b, c) * winding <= 0) continue;

      let contains = false;
      for (const idx of indices) {
        if (idx === iPrev || idx === iCurr || idx === iNext) continue;
        if (pointInTriangle(polygon[idx], a, b, c)) {
          contains = true;
          break;
        }
      }
      if (contains) continue;

      triangles.push([a, b, c]);
      indices.splice(i, 1);
      clipped = true;
      guard = 0;
      break;
    }
    if (!clipped) break;
  }

  if (indices.length === 3) {
    triangles.push([polygon[indices[0]], polygon[indices[1]], polygon[indices[2]]]);
  } else if (!triangles.length) {
    return fanTriangulateConvex(polygon);
  }
  return triangles;
}

export function fanTriangulateConvex(polygon) {
  if (polygon.length < 3) return [];
  const triangles = [];
  const anchor = polygon[0];
  for (let i = 1; i < polygon.length - 1; i += 1) {
    triangles.push([anchor, polygon[i], polygon[i + 1]]);
  }
  return triangles;
}

export function evenoddParityFromRayCast(point, polygon) {
  let crossings = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    if ((a.y <= point.y && b.y > point.y) || (b.y <= point.y && a.y > point.y)) {
      const xIntersect = a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y);
      if (xIntersect > point.x) crossings += 1;
    }
  }
  return crossings % 2 === 1;
}

export const SVG_MATH_TOPIC_MAP = [
  { topic: "de Casteljau subdivision", part: "Part 15", lesson: "068" },
  { topic: "flatness / chord error", part: "Part 15", lesson: "069" },
  { topic: "curvature κ & normal", part: "Part 15", lesson: "070" },
  { topic: "arc center parameters", part: "Part 15", lesson: "071" },
  { topic: "G¹ smooth S/T", part: "Part 15", lesson: "072" },
  { topic: "shoelace area", part: "Part 15", lesson: "073" },
  { topic: "segment intersection", part: "Part 16", lesson: "074" },
  { topic: "line ∩ cubic", part: "Part 16", lesson: "075" },
  { topic: "closest point on curve", part: "Part 16", lesson: "076" },
  { topic: "offset normals", part: "Part 17", lesson: "077" },
  { topic: "offset cusps", part: "Part 17", lesson: "078" },
  { topic: "affine inverse / decompose", part: "Part 18", lesson: "079" },
  { topic: "transform path vs group", part: "Part 18", lesson: "080" },
  { topic: "circle cubic κ", part: "Part 19", lesson: "081" },
  { topic: "rational / exact arcs", part: "Part 19", lesson: "082" },
  { topic: "convex triangulation", part: "Part 20", lesson: "083" },
  { topic: "evenodd parity pixels", part: "Part 20", lesson: "084" },
  { topic: "Gaussian blur kernel", part: "Part 21", lesson: "085" },
  { topic: "Porter–Duff alpha", part: "Part 21", lesson: "086" },
  { topic: "math topic map", part: "Part 22", lesson: "087" }
];
