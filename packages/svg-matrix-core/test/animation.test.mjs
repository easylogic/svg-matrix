import assert from "node:assert/strict";
import test from "node:test";
import {
  applySmilTimingPreset,
  buildAnimateMarkup,
  buildAnimateMotionMarkup,
  buildAnimateTransformMarkup,
  strokeDashDrawKeyframes,
  svgPathElementApiGuide,
  waapiKeyframesForAttribute
} from "../src/animation.js";
import {
  morphPathDLinear,
  sampleMotionAlongPath,
  sampleMotionAlongPathByParameter,
  sampleMotionAlongPathUniform,
  buildArcLengthLookup
} from "../src/engine.js";
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

test("applySmilTimingPreset adds keySplines", () => {
  const opts = applySmilTimingPreset({ dur: "2s" }, "easeInOut");
  const xml = buildAnimateMotionMarkup({ pathD: "M 0 0 L 10 0", ...opts });
  assert.match(xml, /calcMode="spline"/);
  assert.match(xml, /keySplines=/);
});

test("svgPathElementApiGuide lists native and core APIs", () => {
  const guide = svgPathElementApiGuide();
  assert.ok(guide.native.length >= 2);
  assert.ok(guide.core.includes("pathLength(segments)"));
});

test("uniform motion uses lookup table", () => {
  const segments = parsePathD("M 0 0 C 0 50, 100 50, 100 0");
  const lookup = buildArcLengthLookup(segments, { stepsPerCurve: 32 });
  const mid = sampleMotionAlongPathUniform(segments, 0.5, { lookup });
  assert.ok(Math.abs(mid.distance - mid.totalLength * 0.5) < 2);
});

test("waapi keyframes for attribute", () => {
  const kf = waapiKeyframesForAttribute("opacity", 0, 1);
  assert.equal(kf[0].opacity, 0);
  assert.equal(kf[1].opacity, 1);
});

test("parameter motion on line matches uniform", () => {
  const segments = parsePathD("M 0 0 L 100 0");
  const a = sampleMotionAlongPathByParameter(segments, 0.25);
  const b = sampleMotionAlongPathUniform(segments, 0.25, { stepsPerCurve: 8 });
  assert.ok(Math.abs(a.point.x - b.point.x) < 1e-6);
});
