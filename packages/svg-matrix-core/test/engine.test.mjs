import assert from "node:assert/strict";
import test from "node:test";
import {
  arcSegmentToCubics,
  buildArcLengthLookup,
  compareFlattenMethods,
  convertArcsInPathD,
  dashPatternPhaseAtLength,
  flattenPathSegments,
  flattenPathSegmentsAdaptive,
  offsetPathD,
  offsetPolyline,
  parseDashArray,
  pathDFromSegments,
  pathFromD,
  parsePathD,
  strokeDashIntervals,
  listSubpathHandles,
  updateSubpathHandle,
  sampleMotionAlongPathByParameter,
  sampleMotionAlongPathUniform
} from "../src/index.js";

test("parses stroke dasharray", () => {
  assert.deepEqual(parseDashArray("8 4"), [8, 4]);
  assert.deepEqual(parseDashArray("8, 4, 2"), [8, 4, 2]);
});

test("dash phase alternates on and off spans", () => {
  const pattern = [10, 5];
  assert.equal(dashPatternPhaseAtLength(3, pattern, 0).on, true);
  assert.equal(dashPatternPhaseAtLength(12, pattern, 0).on, false);
});

test("stroke dash intervals cover on spans only", () => {
  const intervals = strokeDashIntervals(30, [10, 5], 0);
  assert.ok(intervals.length >= 2);
  assert.ok(intervals.every((span) => span.end > span.start));
});

test("offsets open polyline perpendicular to tangent", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 20, y: 0 }
  ];
  const offset = offsetPolyline(points, 2, false);
  assert.ok(Math.abs(offset[1].y) > 1);
  assert.notEqual(offset[1].y, points[1].y);
});

test("offset path d returns new geometry", () => {
  const result = offsetPathD("M 0 0 L 40 0 L 40 40", 4);
  assert.match(result.d, /^M /);
  assert.ok(result.pointCount >= 3);
});

test("adaptive flatten uses fewer points on straight lines", () => {
  const segments = parsePathD("M 0 0 L 100 0");
  const uniform = flattenPathSegments(segments, { stepsPerCurve: 20 });
  const adaptive = flattenPathSegmentsAdaptive(segments, { tolerance: 0.5 });
  assert.equal(adaptive.length, 2);
  assert.ok(uniform.length >= adaptive.length);
});

test("adaptive flatten subdivides curved segments", () => {
  const segments = parsePathD("M 0 0 C 10 80, 90 -20, 100 0");
  const stats = compareFlattenMethods(segments, { tolerance: 0.5, stepsPerCurve: 12 });
  assert.ok(stats.adaptiveCount > 2);
  assert.ok(stats.uniformCount >= stats.adaptiveCount);
});

test("converts arc segment to cubic beziers", () => {
  const segment = {
    type: "A",
    from: { x: 100, y: 100 },
    rx: 50,
    ry: 50,
    rotation: 0,
    largeArc: false,
    sweep: true,
    to: { x: 200, y: 100 }
  };
  const cubics = arcSegmentToCubics(segment);
  assert.ok(cubics.length >= 1);
  assert.equal(cubics[0].type, "C");
  assert.equal(cubics[0].from.x, 100);
  assert.equal(cubics[cubics.length - 1].to.x, 200);
});

test("convertArcsInPathD removes A commands", () => {
  const result = convertArcsInPathD("M 0 50 A 50 50 0 0 1 100 50");
  assert.equal(result.arcCount, 1);
  assert.ok(!result.d.includes(" A "));
});

test("lists and updates subpath handles independently", () => {
  const d = "M 0 0 L 40 0 M 100 0 L 140 0";
  const { segments } = pathFromD(d);
  const handles = listSubpathHandles(segments);
  assert.equal(handles.length, 4);
  const moved = updateSubpathHandle(segments, "s1:a:1", { x: 120, y: 10 });
  assert.match(pathDFromSegments(moved), /120/);
  const firstAnchor = listSubpathHandles(moved).find((h) => h.id === "s0:a:1");
  assert.equal(firstAnchor.point.x, 40);
});

test("parameter vs uniform motion diverge with multiple segments", () => {
  const segments = parsePathD("M 0 0 C 0 80, 40 0, 40 40 L 200 40");
  const byParam = sampleMotionAlongPathByParameter(segments, 0.5);
  const lookup = buildArcLengthLookup(segments, { stepsPerCurve: 32 });
  const byLength = sampleMotionAlongPathUniform(segments, 0.5, { lookup });
  const delta = Math.hypot(byParam.point.x - byLength.point.x, byParam.point.y - byLength.point.y);
  assert.ok(delta > 10);
});

test("arc length lookup reaches end at progress 1", () => {
  const segments = parsePathD("M 0 0 L 100 0");
  const end = sampleMotionAlongPathUniform(segments, 1, { stepsPerCurve: 16 });
  assert.ok(Math.abs(end.point.x - 100) < 1);
});
