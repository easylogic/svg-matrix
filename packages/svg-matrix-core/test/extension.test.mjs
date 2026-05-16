import assert from "node:assert/strict";
import test from "node:test";
import {
  FIGMA_PAINT_GAP_MAP,
  FIGMA_SVG_LAYERS,
  SVG_CAPABILITY_MAP,
  arcSegmentToCubics,
  buildMarkerMarkup,
  buildTextPathMarkup,
  explainCoordinateStack,
  figmaAngularGradientToCss,
  figmaPaintToSvg,
  figmaRadialGradientPaintToSvg,
  figmaStrokeAlignToSvgMarkup,
  flattenPathSegments,
  parsePathD,
  pathPaintModel
} from "../src/index.js";

test("primer maps list series topics", () => {
  assert.ok(SVG_CAPABILITY_MAP.length >= 8);
  assert.ok(FIGMA_SVG_LAYERS.some((row) => row.layer === "Paint"));
});

test("coordinate stack explains pointer to user space", () => {
  const stack = explainCoordinateStack(
    { x: 320, y: 210 },
    { width: 640, height: 420 },
    { x: 0, y: 0, width: 640, height: 420 }
  );
  assert.equal(stack.userSpace.x, 320);
  assert.equal(stack.userSpace.y, 210);
});

test("path paint model documents fill vs stroke", () => {
  const model = pathPaintModel();
  assert.match(model.fill, /closed/);
  assert.match(model.stroke, /centerline/);
});

test("figma radial gradient builds svg markup", () => {
  const paint = {
    type: "GRADIENT_RADIAL",
    gradientStops: [
      { position: 0, color: { r: 0.1, g: 0.4, b: 1, a: 1 } },
      { position: 1, color: { r: 1, g: 1, b: 1, a: 1 } }
    ]
  };
  const svg = figmaRadialGradientPaintToSvg(paint);
  assert.match(svg.markup, /radialGradient/);
  assert.match(svg.fill, /url\(#/);
});

test("figma angular gradient falls back to css conic", () => {
  const css = figmaAngularGradientToCss({
    gradientStops: [{ position: 0, color: { r: 1, g: 0, b: 0, a: 1 } }, { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } }]
  });
  assert.match(css.background, /conic-gradient/);
});

test("figma stroke inside uses clip path", () => {
  const result = figmaStrokeAlignToSvgMarkup({
    pathD: "M 0 0 L 40 0 L 40 40 Z",
    stroke: { weight: 2, align: "INSIDE", color: { r: 0, g: 0, b: 0, a: 1 } }
  });
  assert.match(result.markup, /clipPath/);
});

test("figma paint gap map documents angular partial support", () => {
  const angular = FIGMA_PAINT_GAP_MAP.find((row) => row.figma === "GRADIENT_ANGULAR");
  assert.equal(angular.supported, "partial");
});

test("svg marker and textPath markup", () => {
  assert.match(buildMarkerMarkup({ id: "arr" }), /marker id="arr"/);
  assert.match(buildTextPathMarkup({ pathD: "M 0 0 L 100 0", text: "SVG" }), /textPath/);
});

test("flatten uses accurate arc sampling", () => {
  const segments = parsePathD("M 0 50 A 50 50 0 0 1 100 50");
  const points = flattenPathSegments(segments, { stepsPerArc: 8 });
  const mid = points[Math.floor(points.length / 2)];
  assert.ok(mid.y < 45, "arc midpoint should bow below chord");
});

test("arc cubics preserve endpoints", () => {
  const segment = parsePathD("M 0 50 A 50 50 0 0 1 100 50").find((s) => s.type === "A");
  const cubics = arcSegmentToCubics(segment);
  assert.equal(cubics[0].from.x, 0);
  assert.equal(cubics[cubics.length - 1].to.x, 100);
});

test("figmaPaintToSvg dispatches by type", () => {
  const solid = figmaPaintToSvg({ type: "SOLID", color: { r: 1, g: 0, b: 0, a: 1 } }, { x: 0, y: 0, width: 10, height: 10 });
  assert.equal(solid.type, "SOLID");
  assert.ok(solid.fill);
});
