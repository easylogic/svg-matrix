import assert from "node:assert/strict";
import test from "node:test";
import {
  CIRCLE_CUBIC_KAPPA,
  closestPointOnCubic,
  cubicCubicIntersections,
  cubicFlatnessError,
  cubicCurvatureAt,
  earClipTriangulate,
  decomposeAffineMatrix,
  gaussianKernel1D,
  invertAffineMatrix,
  lineCubicIntersections,
  lineSegmentIntersection,
  porterDuffSourceOver,
  reflectControlForSmoothContinuation,
  shoelaceArea,
  subdivideCubicBezier,
  unitCircleQuarterCubics
} from "../src/geometry.js";
import { cubicBezierPoint } from "../src/index.js";

test("subdivide cubic preserves endpoints", () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 0, y: 40 };
  const p2 = { x: 80, y: 40 };
  const p3 = { x: 80, y: 0 };
  const { left, right } = subdivideCubicBezier(p0, p1, p2, p3);
  assert.deepEqual(left.p0, p0);
  assert.deepEqual(right.p3, p3);
  assert.ok(Math.abs(left.p3.x - right.p0.x) < 1e-9);
});

test("flatness zero on straight cubic", () => {
  const err = cubicFlatnessError({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 0 });
  assert.ok(err < 1e-9);
});

test("line segment intersection", () => {
  const hit = lineSegmentIntersection({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 });
  assert.ok(hit);
  assert.ok(Math.abs(hit.point.x - 5) < 1e-6);
});

test("line cubic finds intersection", () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 40, y: 80 };
  const p2 = { x: 80, y: 80 };
  const p3 = { x: 120, y: 0 };
  const hits = lineCubicIntersections(p0, p1, p2, p3, { x: 60, y: -10 }, { x: 60, y: 120 });
  assert.ok(hits.length >= 1);
});

test("closest point on cubic lands near on-curve query", () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 0, y: 100 };
  const p2 = { x: 100, y: 100 };
  const p3 = { x: 100, y: 0 };
  const query = cubicBezierPoint(p0, p1, p2, p3, 0.5);
  const result = closestPointOnCubic(query, p0, p1, p2, p3);
  assert.ok(result.distance < 1);
  assert.ok(Math.abs(result.t - 0.5) < 0.05);
});

test("smooth reflection doubles anchor minus control", () => {
  const anchor = { x: 100, y: 100 };
  const prev = { x: 80, y: 60 };
  const reflected = reflectControlForSmoothContinuation(anchor, prev);
  assert.equal(reflected.x, 120);
  assert.equal(reflected.y, 140);
});

test("shoelace area of unit square", () => {
  const area = shoelaceArea([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 }
  ]);
  assert.ok(Math.abs(area - 1) < 1e-9);
});

test("invert affine matrix round trip", () => {
  const m = { a: 2, b: 0, c: 0, d: 3, e: 10, f: 20 };
  const inv = invertAffineMatrix(m);
  const product = {
    a: m.a * inv.a + m.c * inv.b,
    b: m.b * inv.a + m.d * inv.b,
    c: m.a * inv.c + m.c * inv.d,
    d: m.b * inv.c + m.d * inv.d,
    e: m.a * inv.e + m.c * inv.f + m.e,
    f: m.b * inv.e + m.d * inv.f + m.f
  };
  assert.ok(Math.abs(product.a - 1) < 1e-9);
  assert.ok(Math.abs(product.d - 1) < 1e-9);
});

test("decompose extracts translation", () => {
  const parts = decomposeAffineMatrix({ a: 1, b: 0, c: 0, d: 1, e: 12, f: -4 });
  assert.equal(parts.translate.x, 12);
  assert.equal(parts.translate.y, -4);
});

test("circle cubic kappa constant", () => {
  assert.ok(Math.abs(CIRCLE_CUBIC_KAPPA - 0.5522847498) < 1e-6);
  assert.equal(unitCircleQuarterCubics().length, 1);
});

test("gaussian kernel sums to one", () => {
  const kernel = gaussianKernel1D(2);
  const sum = kernel.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
});

test("porter duff over opaque source", () => {
  const out = porterDuffSourceOver(
    { r: 1, g: 0, b: 0, a: 1 },
    { r: 0, g: 1, b: 0, a: 1 }
  );
  assert.ok(out.r > 0.9);
  assert.ok(out.g < 0.1);
});

test("cubic cubic intersection finds crossing", () => {
  const a0 = { x: 40, y: 360 };
  const a1 = { x: 200, y: 40 };
  const a2 = { x: 440, y: 380 };
  const a3 = { x: 600, y: 80 };
  const b0 = { x: 40, y: 40 };
  const b1 = { x: 220, y: 380 };
  const b2 = { x: 420, y: 40 };
  const b3 = { x: 600, y: 360 };
  const hits = cubicCubicIntersections(a0, a1, a2, a3, b0, b1, b2, b3);
  assert.ok(hits.length >= 1);
});

test("ear clip triangulates concave polygon", () => {
  const poly = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 40 },
    { x: 40, y: 40 },
    { x: 40, y: 100 },
    { x: 0, y: 100 }
  ];
  const tris = earClipTriangulate(poly);
  assert.ok(tris.length >= 4);
});

test("curvature nonzero on bent cubic", () => {
  const k = cubicCurvatureAt({ x: 0, y: 0 }, { x: 0, y: 80 }, { x: 80, y: 80 }, { x: 80, y: 0 }, 0.5);
  assert.ok(Math.abs(k) > 0.001);
});
