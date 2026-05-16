---
title: "Figma paint → SVG gap map"
---

# Figma paint → SVG gap map

Part 13과 `figma-bridge.js`의 `FIGMA_PAINT_GAP_MAP` 요약.

| Figma | SVG | 지원 | 함수 |
|-------|-----|------|------|
| SOLID | fill | ✅ | `figmaSolidPaintToSvg` |
| GRADIENT_LINEAR | linearGradient | ✅ | `figmaLinearGradientPaintToSvg` |
| GRADIENT_RADIAL | radialGradient | ✅ | `figmaRadialGradientPaintToSvg` |
| GRADIENT_ANGULAR | CSS conic-gradient | ⚠️ partial | `figmaAngularGradientToCss` |
| IMAGE | pattern / image | ✅ | `figmaImagePaintToSvg` |

## Stroke align

| Figma | SVG 접근 |
|-------|----------|
| CENTER | 일반 `stroke` |
| INSIDE | `clipPath` + 2× `stroke-width` |
| OUTSIDE | offset path / 이중 path (근사) |

`figmaStrokeAlignToSvgMarkup`

## Compositing

`FIGMA_BLEND_MAP` — Figma `blendMode` → SVG `mix-blend-mode`.

`figmaLayerCompositingToSvg` — `opacity`, `isolation`.
