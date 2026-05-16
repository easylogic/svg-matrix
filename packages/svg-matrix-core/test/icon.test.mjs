import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSvgSpriteSheet,
  buildSvgSymbol,
  currentColorAttributes,
  douglasPeucker,
  nearestCrispStrokeWidth,
  simplifyPathD,
  snapPathDToIconGrid,
  snapToHalfPixel,
  svgMarkupToDataUri
} from "../src/index.js";

test("snaps values to half pixel grid", () => {
  assert.equal(snapToHalfPixel(10.2), 10);
  assert.equal(snapToHalfPixel(10.3), 10.5);
});

test("picks nearest crisp stroke width", () => {
  assert.equal(nearestCrispStrokeWidth(1.4), 1.5);
});

test("simplifies path point count", () => {
  const curve = "M 0 12 C 6 0, 18 24, 24 12";
  const result = simplifyPathD(curve, 1.2, { stepsPerCurve: 16 });
  assert.ok(result.originalCount > 4);
  assert.ok(result.pointCount <= result.originalCount);
});

test("douglas peucker keeps endpoints", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 5, y: 2 },
    { x: 10, y: 0 }
  ];
  const simplified = douglasPeucker(points, 0.5);
  assert.deepEqual(simplified[0], points[0]);
  assert.deepEqual(simplified[simplified.length - 1], points[2]);
});

test("builds symbol sprite and data uri", () => {
  const symbol = buildSvgSymbol({
    id: "icon-home",
    content: '<path d="M12 3 L20 12 V20 H4 V12 Z"/>'
  });
  assert.match(symbol, /symbol id="icon-home"/);
  const sheet = buildSvgSpriteSheet([symbol]);
  assert.match(sheet, /display:none/);
  const uri = svgMarkupToDataUri("<svg></svg>");
  assert.match(uri, /^data:image\/svg\+xml,/);
});

test("currentColor attributes for tintable icons", () => {
  assert.equal(currentColorAttributes("fill").fill, "currentColor");
  assert.equal(currentColorAttributes("stroke").stroke, "currentColor");
});

test("snaps path coordinates to grid", () => {
  const snapped = snapPathDToIconGrid("M 10.2 10.7 L 14.8 10.1");
  assert.match(snapped.d, /10\.5|10 |10$/);
});
