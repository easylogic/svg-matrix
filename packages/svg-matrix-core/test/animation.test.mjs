import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAnimateMarkup,
  buildAnimateMotionMarkup,
  buildAnimateTransformMarkup,
  strokeDashDrawKeyframes
} from "../src/animation.js";
import { morphPathDLinear, sampleMotionAlongPath } from "../src/engine.js";
import { parsePathD } from "../src/index.js";

test("buildAnimateMarkup", () => {
  const xml = buildAnimateMarkup({ attributeName: "opacity", from: 0, to: 1, dur: "1s" });
  assert.match(xml, /attributeName="opacity"/);
  assert.match(xml, /from="0"/);
});

test("buildAnimateTransformMarkup", () => {
  const xml = buildAnimateTransformMarkup({ type: "rotate", from: 0, to: 360, dur: "3s" });
  assert.match(xml, /type="rotate"/);
});

test("buildAnimateMotionMarkup with path", () => {
  const xml = buildAnimateMotionMarkup({ pathD: "M 0 0 L 100 0", dur: "2s" });
  assert.match(xml, /animateMotion/);
  assert.match(xml, /path="M 0 0 L 100 0"/);
});

test("stroke dash draw keyframes", () => {
  const kit = strokeDashDrawKeyframes(200);
  assert.equal(kit.pathLength, 200);
  assert.match(kit.keyframes, /stroke-dashoffset: 0/);
});

test("morph compatible paths", () => {
  const a = "M 0 0 L 100 0 L 100 100 Z";
  const b = "M 0 0 L 200 0 L 200 100 Z";
  const mid = morphPathDLinear(a, b, 0.5);
  assert.equal(mid.compatible, true);
  assert.match(mid.d, /L 150/);
});

test("sample motion along path", () => {
  const segments = parsePathD("M 0 0 L 100 0");
  const start = sampleMotionAlongPath(segments, 0);
  const end = sampleMotionAlongPath(segments, 1);
  assert.ok(Math.abs(start.point.x) < 1e-6);
  assert.ok(Math.abs(end.point.x - 100) < 1);
});
