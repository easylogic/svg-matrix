import assert from "node:assert/strict";
import test from "node:test";
import {
  figmaBooleanPathsToSvg,
  figmaBooleanToFillRule,
  figmaClipToSvgMarkup,
  figmaLinearGradientPaintToSvg,
  figmaMaskToSvgMarkup,
  figmaNetworkToPathD,
  figmaSolidPaintToSvg,
  figmaStrokeToSvgAttributes,
  pathDToFigmaNetwork,
  pathFromD
} from "../src/index.js";

test("converts figma vector network to path d", () => {
  const d = figmaNetworkToPathD({
    vertices: [
      { x: 0, y: 0 },
      { x: 40, y: 0 },
      { x: 40, y: 40 },
      { x: 0, y: 40 }
    ],
    segments: [
      { start: 0, end: 1 },
      { start: 1, end: 2 },
      { start: 2, end: 3 },
      { start: 3, end: 0 }
    ],
    closed: true
  });
  assert.match(d, /^M 0 0/);
  assert.match(d, /Z$/);
});

test("round-trips path d through figma network", () => {
  const original = "M 10 10 L 50 10 L 50 50 Z";
  const network = pathDToFigmaNetwork(original);
  assert.equal(network.vertices.length, 3);
  const rebuilt = figmaNetworkToPathD(network);
  assert.equal(pathFromD(rebuilt).d, pathFromD(original).d);
});

test("maps figma solid and stroke to svg attributes", () => {
  const fill = figmaSolidPaintToSvg({ color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 0.8 });
  assert.match(fill.fill, /rgb/);
  const stroke = figmaStrokeToSvgAttributes({
    color: { r: 0, g: 0, b: 0, a: 1 },
    weight: 2,
    cap: "ROUND",
    join: "MITER"
  });
  assert.equal(stroke["stroke-width"], 2);
  assert.equal(stroke["stroke-linecap"], "round");
});

test("builds linear gradient markup from figma paint", () => {
  const gradient = figmaLinearGradientPaintToSvg(
    {
      type: "GRADIENT_LINEAR",
      gradientHandlePositions: [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 }
      ],
      gradientStops: [
        { position: 0, color: { r: 0, g: 0, b: 1, a: 1 } },
        { position: 1, color: { r: 1, g: 1, b: 0, a: 1 } }
      ]
    },
    { x: 0, y: 0, width: 100, height: 100 }
  );
  assert.match(gradient.markup, /linearGradient/);
  assert.equal(gradient.fill, "url(#figma-linear)");
});

test("maps boolean operations to fill rules", () => {
  assert.equal(figmaBooleanToFillRule("SUBTRACT"), "evenodd");
  const merged = figmaBooleanPathsToSvg([{ d: "M 0 0 L 40 0 L 40 40 Z" }, { d: "M 10 10 L 30 10 L 30 30 Z" }], "SUBTRACT");
  assert.match(merged.svg, /evenodd/);
});

test("builds clip and mask markup", () => {
  const clip = figmaClipToSvgMarkup({ pathD: "M 0 0 L 100 0 L 50 50 Z" });
  assert.match(clip.markup, /clipPath/);
  const mask = figmaMaskToSvgMarkup({ pathD: "M 0 0 L 100 0 L 50 50 Z" });
  assert.match(mask.markup, /<mask/);
});
