import assert from "node:assert/strict";
import test from "node:test";
import {
  applySvgMatrix,
  bboxOfPath,
  cubicBezierPoint,
  distancePointToSegment,
  flattenPathSegments,
  linearGradientStopParameter,
  miterLength,
  parsePathD,
  parseSvgMatrix,
  parseTransformAttribute,
  parseViewBox,
  pathDFromSegments,
  pathLength,
  pointAtPathLength,
  pointInPath,
  parsePathMoveLine,
  pathSegmentsToD,
  shouldBevelJoin,
  viewBoxToViewport,
  windingNumber
} from "../src/index.js";

test("parses viewBox", () => {
  assert.deepEqual(parseViewBox("0 0 100 50"), { x: 0, y: 0, width: 100, height: 50 });
});

test("maps viewBox to viewport with meet", () => {
  const mapped = viewBoxToViewport(parseViewBox("0 0 100 50"), 200, 200, "xMidYMid", "meet");
  assert.ok(Math.abs(mapped.scale - 2) < 1e-9);
  assert.ok(Math.abs(mapped.translateX - 0) < 1e-9);
  assert.ok(Math.abs(mapped.translateY - 50) < 1e-9);
});

test("parses move and line path commands", () => {
  const segments = parsePathMoveLine("M 10 20 L 30 40 L 10 20 Z");
  assert.equal(segments.length, 4);
  assert.equal(segments[0].type, "M");
  assert.deepEqual(segments[1].to, { x: 30, y: 40 });
});

test("parses H and V as line segments", () => {
  const segments = parsePathD("M 0 0 H 100 V 50 h -20 v -10");
  const lines = segments.filter((segment) => segment.type === "L");
  assert.equal(lines.length, 4);
  assert.deepEqual(lines[lines.length - 1].to, { x: 80, y: 40 });
});

test("parses cubic and quadratic curves", () => {
  const segments = parsePathD("M 0 0 C 10 0 20 10 30 30 Q 40 50 50 50");
  assert.equal(segments[1].type, "C");
  assert.equal(segments[2].type, "Q");
});

test("round-trips simple path d strings", () => {
  const original = "M 0 0 L 100 0 L 100 80 Z";
  const rebuilt = pathSegmentsToD(parsePathMoveLine(original));
  assert.equal(rebuilt, "M 0 0 L 100 0 L 100 80 L 0 0");
});

test("computes distance from point to segment", () => {
  const distance = distancePointToSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 });
  assert.ok(Math.abs(distance - 5) < 1e-9);
});

test("flattens cubic bezier into polyline", () => {
  const segments = parsePathD("M 0 0 C 0 100 100 100 100 0");
  const points = flattenPathSegments(segments, { stepsPerCurve: 4 });
  assert.ok(points.length >= 4);
  assert.deepEqual(points[0], { x: 0, y: 0 });
});

test("cubic bezier endpoint", () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 0, y: 10 };
  const p2 = { x: 10, y: 10 };
  const p3 = { x: 10, y: 0 };
  assert.deepEqual(cubicBezierPoint(p0, p1, p2, p3, 1), p3);
});

test("path length and point at length", () => {
  const segments = parsePathD("M 0 0 L 100 0");
  const length = pathLength(segments);
  assert.ok(Math.abs(length - 100) < 1e-6);
  const sample = pointAtPathLength(segments, 25);
  assert.ok(Math.abs(sample.point.x - 25) < 1e-6);
});

test("bbox includes curve extent", () => {
  const segments = parsePathD("M 0 0 C 0 80 80 80 80 0");
  const box = bboxOfPath(segments, { stepsPerCurve: 24 });
  assert.ok(box.width > 50);
  assert.ok(box.height > 20);
});

test("winding and fill rules", () => {
  const square = parsePathD("M 0 0 L 40 0 L 40 40 L 0 40 Z");
  assert.equal(pointInPath({ x: 10, y: 10 }, square, "nonzero"), true);
  assert.equal(pointInPath({ x: 10, y: 10 }, square, "evenodd"), true);
});

test("miter length spikes on acute angles", () => {
  const joinAngle = Math.PI / 16;
  const miter = miterLength(joinAngle, 10);
  assert.ok(miter > 10);
  assert.equal(shouldBevelJoin(joinAngle, 10, 4), true);
});

test("svg matrix and transform list", () => {
  const matrix = parseSvgMatrix("matrix(1 0 0 1 10 20)");
  assert.deepEqual(applySvgMatrix(matrix, { x: 5, y: 7 }), { x: 15, y: 27 });
  const combined = parseTransformAttribute("translate(10 0) scale(2)");
  assert.deepEqual(applySvgMatrix(combined, { x: 1, y: 1 }), { x: 12, y: 2 });
});

test("linear gradient stop parameter", () => {
  const t = linearGradientStopParameter({ x: 50, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 });
  assert.ok(Math.abs(t - 0.5) < 1e-9);
});

test("winding number for nested square", () => {
  const outer = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
  assert.equal(windingNumber({ x: 50, y: 50 }, outer), 1);
});
