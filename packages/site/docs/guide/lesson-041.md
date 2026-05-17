---
id: "041"
title: "fill · stroke export"
part: "Part 10. Figma ↔ SVG bridge"
demo: "figma-fill-stroke"
---

# fill · stroke export

Figma **paint·stroke** JSON을 SVG `fill`, `stroke`, `stroke-width`, `<defs>` gradient로 매핑합니다. [040](./lesson-040.md) geometry 위 **paint 레이어**입니다.

<LessonDemo id="041" />

## 데모에서 볼 것

- **rect** + `figmaLinearGradientPaintToSvg` fill  
- toolbar **strokeWeight** 1–12  
- `figmaStrokeToSvgAttributes` → stroke attrs JSON readout  

```js
// readout 구조
fill (GRADIENT_LINEAR): <linearGradient>…
stroke attrs: { stroke, stroke-width, stroke-linecap, … }
```

bbox `{ x:180, y:100, width:280, height:180 }` — [019](./lesson-019.md) objectBoundingBox handles.

## SOLID fill

```js
import { figmaSolidPaintToSvg } from "svg-matrix-core";

figmaSolidPaintToSvg({
  type: "SOLID",
  color: { r: 1, g: 0, b: 0, a: 1 },
  opacity: 0.9
});
// { fill: "#ff0000", "fill-opacity": 0.9 }
```

## GRADIENT_LINEAR

```js
import { figmaLinearGradientPaintToSvg } from "svg-matrix-core";

const gradient = figmaLinearGradientPaintToSvg(
  {
    type: "GRADIENT_LINEAR",
    gradientHandlePositions: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }],
    gradientStops: [
      { position: 0, color: { r: 0.15, g: 0.39, b: 0.92, a: 1 } },
      { position: 1, color: { r: 0.96, g: 0.62, b: 0.04, a: 1 } }
    ]
  },
  bbox,
  { gradientId: "figma-fill" }
);
// { fill: "url(#figma-fill)", markup: "<linearGradient>…" }
```

[032](./lesson-032.md) radial · [057](./lesson-057.md) gap map.

## stroke

```js
import { figmaStrokeToSvgAttributes } from "svg-matrix-core";

figmaStrokeToSvgAttributes({
  color: { r: 0.06, g: 0.09, b: 0.16, a: 1 },
  weight: 4,
  cap: "ROUND",
  join: "ROUND",
  align: "CENTER"   // INSIDE | OUTSIDE → data-figma-stroke-align
});
```

| Figma | SVG |
|-------|-----|
| ROUND cap | `stroke-linecap="round"` |
| MITER join | `stroke-linejoin="miter"` |

**INSIDE / OUTSIDE** — SVG 1.1 center만 native → `figmaStrokeAlignToSvgMarkup` ([006](./lesson-006.md), [058](./lesson-058.md)).

## Core API

| 함수 | 역할 |
|------|------|
| `figmaSolidPaintToSvg` | SOLID → attrs |
| `figmaLinearGradientPaintToSvg` | linear + defs markup |
| `figmaStrokeToSvgAttributes` | stroke attrs |
| `figmaNodeToSvgAttributes` | node fills/strokes 합침 |

## 관련

- [019](./lesson-019.md) · [005](./lesson-005.md) · [006](./lesson-006.md) · [057](./lesson-057.md)

## 오늘의 핵심

export = geometry + **paint attribute**. strokeAlign은 attribute 한 줄이 아니라 clip/offset 패턴입니다.
