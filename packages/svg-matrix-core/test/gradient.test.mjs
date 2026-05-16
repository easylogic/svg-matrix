import assert from "node:assert/strict";
import test from "node:test";
import {
  applySpreadMethod,
  interpolateColorStops,
  linearGradientStopParameter,
  objectBoundingBoxToUserSpace,
  patternTileCoordinates,
  radialGradientStopParameter,
  sampleLinearGradient,
  sampleRadialGradient,
  userSpaceToObjectBoundingBox
} from "../src/index.js";

const bbox = { x: 100, y: 50, width: 200, height: 100 };
const stops = [
  { offset: 0, color: "#2563eb" },
  { offset: 1, color: "#f59e0b" }
];

test("object bounding box converts both ways", () => {
  const user = objectBoundingBoxToUserSpace({ x: 0.5, y: 0.5 }, bbox);
  assert.equal(user.x, 200);
  assert.equal(user.y, 100);
  const normalized = userSpaceToObjectBoundingBox(user, bbox);
  assert.ok(Math.abs(normalized.x - 0.5) < 1e-9);
});

test("radial stop parameter grows with distance", () => {
  const center = { x: 0, y: 0 };
  assert.ok(radialGradientStopParameter({ x: 25, y: 0 }, center, 50) < 1);
  assert.ok(radialGradientStopParameter({ x: 50, y: 0 }, center, 50) - 1 < 1e-9);
});

test("spread methods remap t", () => {
  assert.equal(applySpreadMethod(1.4, "pad"), 1);
  assert.ok(Math.abs(applySpreadMethod(1.4, "repeat") - 0.4) < 1e-9);
  assert.ok(Math.abs(applySpreadMethod(1.6, "reflect") - 0.4) < 1e-9);
});

test("interpolates color stops", () => {
  const mid = interpolateColorStops(0.5, stops);
  assert.ok(mid.r > 0.2 && mid.r < 0.9);
});

test("samples linear gradient in object bounding box units", () => {
  const result = sampleLinearGradient(
    { x: 200, y: 100 },
    {
      gradientUnits: "objectBoundingBox",
      x1: 0,
      y1: 0.5,
      x2: 1,
      y2: 0.5,
      stops
    },
    bbox
  );
  assert.ok(result.mappedT > 0.4 && result.mappedT < 0.6);
});

test("samples radial gradient from center", () => {
  const result = sampleRadialGradient(
    { x: 200, y: 100 },
    {
      gradientUnits: "userSpaceOnUse",
      cx: 200,
      cy: 100,
      r: 80,
      stops
    },
    bbox
  );
  assert.ok(result.mappedT < 0.1);
});

test("pattern tile coordinates wrap", () => {
  const tile = patternTileCoordinates({ x: 45, y: 35 }, { x: 0, y: 0 }, 20, 20);
  assert.equal(tile.tileX, 2);
  assert.equal(tile.tileY, 1);
  assert.ok(Math.abs(tile.u - 0.25) < 1e-9);
});
