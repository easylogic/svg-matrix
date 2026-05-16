import assert from "node:assert/strict";
import test from "node:test";
import {
  FIGMA_EFFECT_FILTER_MAP,
  buildDropShadowFilterChain,
  figmaBackgroundBlurToSvgFilter,
  figmaBlurRadiusToStdDeviation,
  figmaDropShadowToSvgFilter,
  figmaEffectToSvgFilter,
  figmaInnerShadowToSvgFilter,
  figmaLayerBlurToSvgFilter
} from "../src/index.js";

test("maps figma drop shadow to svg filter markup", () => {
  const result = figmaDropShadowToSvgFilter({
    offset: { x: 0, y: 4 },
    radius: 8,
    color: { r: 0, g: 0, b: 0, a: 0.25 }
  });
  assert.equal(result.filterId, "figma-drop-shadow");
  assert.match(result.markup, /feDropShadow/);
  assert.match(result.markup, /dy="4"/);
  assert.match(result.markup, /stdDeviation="4"/);
  assert.equal(result.filterAttr, "url(#figma-drop-shadow)");
});

test("figma blur radius maps to stdDeviation", () => {
  assert.equal(figmaBlurRadiusToStdDeviation(10), 5);
});

test("builds manual drop shadow filter chain", () => {
  const chain = buildDropShadowFilterChain({ offset: { x: 2, y: 4 }, radius: 6 });
  assert.match(chain.markup, /feGaussianBlur/);
  assert.match(chain.markup, /feOffset/);
  assert.match(chain.markup, /feMerge/);
});

test("maps inner shadow filter chain", () => {
  const inner = figmaInnerShadowToSvgFilter({ radius: 8, offset: { x: 0, y: 3 } });
  assert.match(inner.markup, /feComposite/);
  assert.match(inner.markup, /innerShadow/);
});

test("maps layer and background blur", () => {
  const layer = figmaLayerBlurToSvgFilter({ radius: 12 });
  assert.match(layer.markup, /feGaussianBlur/);
  assert.match(layer.markup, /SourceGraphic/);
  const backdrop = figmaBackgroundBlurToSvgFilter({ radius: 16 });
  assert.match(backdrop.markup, /BackgroundImage/);
});

test("figmaEffectToSvgFilter dispatches by type", () => {
  const drop = figmaEffectToSvgFilter({ type: "DROP_SHADOW", radius: 4 });
  assert.equal(drop.type, "DROP_SHADOW");
  const inner = figmaEffectToSvgFilter({ type: "INNER_SHADOW", radius: 4 });
  assert.equal(inner.type, "INNER_SHADOW");
});

test("documents figma effect mapping table", () => {
  assert.equal(FIGMA_EFFECT_FILTER_MAP.length, 4);
});
