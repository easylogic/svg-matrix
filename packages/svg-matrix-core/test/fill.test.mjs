import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyPointInPath,
  parsePathD,
  pointInPathBoolean,
  rayCrossingCount,
  segmentsToSubpaths,
  signedPolygonArea,
  windingNumber
} from "../src/index.js";

test("ray crossing and winding agree on simple square", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 40 },
    { x: 0, y: 40 }
  ];
  const point = { x: 10, y: 10 };
  assert.equal(windingNumber(point, square), 1);
  assert.equal(rayCrossingCount(point, square), 1);
});

test("splits segments into subpaths at M commands", () => {
  const segments = parsePathD("M 0 0 L 10 0 M 20 0 L 30 0");
  assert.equal(segmentsToSubpaths(segments).length, 2);
});

test("compound path hole: evenodd vs nonzero diverge", () => {
  const d = "M 0 0 L 40 0 L 40 40 L 0 40 Z M 10 10 L 30 10 L 30 30 L 10 30 Z";
  const hole = classifyPointInPath({ x: 20, y: 20 }, parsePathD(d), "nonzero");
  assert.equal(hole.insideEvenOdd, false);
  assert.equal(hole.insideNonZero, true);
  const ring = classifyPointInPath({ x: 5, y: 5 }, parsePathD(d), "nonzero");
  assert.equal(ring.inside, true);
});

test("self-intersecting bow-tie lobe is outside by evenodd", () => {
  const d = "M 0 0 L 40 40 L 40 0 L 0 40 Z";
  const lobe = classifyPointInPath({ x: 5, y: 5 }, parsePathD(d), "evenodd");
  assert.equal(lobe.crossings, 2);
  assert.equal(lobe.inside, false);
});

test("path boolean subtract removes inner region", () => {
  const outer = parsePathD("M 0 0 L 60 0 L 60 60 L 0 60 Z");
  const inner = parsePathD("M 20 20 L 40 20 L 40 40 L 20 40 Z");
  assert.equal(pointInPathBoolean({ x: 10, y: 10 }, outer, inner, "subtract"), true);
  assert.equal(pointInPathBoolean({ x: 30, y: 30 }, outer, inner, "subtract"), false);
});

test("signed area is positive for counter-clockwise square", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ];
  assert.ok(signedPolygonArea(square) > 0);
});
