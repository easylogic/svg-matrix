---
id: "057"
title: "Figma paint gap map"
part: "Part 12. Primer"
demo: "figma-paint-gap"
---

# Figma paint gap map

Figma paint 타입별 **SVG export 지원**과 `figmaPaintToSvg` 샘플을 확인합니다.

<LessonDemo id="057" />

## 데모에서 볼 것

- **paint** select — `FIGMA_PAINT_GAP_MAP` 행  
- readout: `figma → svg`, `supported=…`, `notes`, `figmaPaintToSvg` JSON  

```js
figmaPaintToSvg(
  { type, color, gradientStops, imageRef: "#pattern" },
  { x: 0, y: 0, width: 100, height: 100 }
);
```

## FIGMA_PAINT_GAP_MAP

| figma | supported | 비고 |
|-------|-----------|------|
| SOLID | `true` | `figmaSolidPaintToSvg` |
| GRADIENT_LINEAR | `true` | [019](./lesson-019.md) |
| GRADIENT_RADIAL | `true` | `figmaRadialGradientPaintToSvg` |
| GRADIENT_ANGULAR | `"partial"` | CSS conic / mask |
| IMAGE | `true` | pattern / image |
| EMOJI / VIDEO | `false` | raster / HTML |

```js
import { FIGMA_PAINT_GAP_MAP, figmaPaintToSvg } from "svg-matrix-core";
```

## strokeAlign (별도)

| Figma | SVG 1.1 |
|-------|---------|
| CENTER | native |
| INSIDE / OUTSIDE | [006](./lesson-006.md) `figmaStrokeAlignToSvgMarkup` |

## 전략

```txt
supported  → [041](./lesson-041.md) 자동 export
partial    → 문서 + fallback
false      → rasterize 또는 수동
```

## Core API

| export | 역할 |
|--------|------|
| `FIGMA_PAINT_GAP_MAP` | type, svg, supported, notes |
| `figmaPaintToSvg` | 통합 export 샘플 |

## 관련

- [041](./lesson-041.md) · [019](./lesson-019.md) · [055](./lesson-055.md)

## 오늘의 핵심

Figma paint ≠ SVG 1:1 — gap map + `figmaPaintToSvg`로 export 전략을 정합니다.
