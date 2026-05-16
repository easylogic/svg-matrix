---
title: "Figma node → SVG 매핑"
---

# Figma node → SVG 매핑

Part 10 강의와 `svg-matrix-core/src/figma-bridge.js`가 참조하는 요약표입니다.

## Geometry

| Figma | SVG | 함수 |
|-------|-----|------|
| `vectorNetwork` | `<path d="...">` | `figmaNetworkToPathD`, `pathDToFigmaNetwork` |

## Paint

| Figma | SVG | 함수 |
|-------|-----|------|
| `SOLID` fill | `fill`, `fill-opacity` | `figmaSolidPaintToSvg` |
| `GRADIENT_LINEAR` | `<linearGradient>` + `fill="url(#id)"` | `figmaLinearGradientPaintToSvg` |
| stroke | `stroke`, `stroke-width`, cap/join | `figmaStrokeToSvgAttributes` |

## Boolean

| Figma op | SVG hint | `fill-rule` |
|----------|----------|-------------|
| UNION | compound path | `nonzero` |
| SUBTRACT | hole / evenodd | `evenodd` |
| INTERSECT | intersection | `nonzero` |
| EXCLUDE | xor | `evenodd` |

`figmaBooleanPathsToSvg(paths, operation)`

## Masking

| Figma | SVG | 함수 |
|-------|-----|------|
| clip mask | `<clipPath>` | `figmaClipToSvgMarkup` |
| alpha mask | `<mask>` | `figmaMaskToSvgMarkup` |

## css-matrix와의 관계

- **css-matrix** — DOM/CSS gradient 양방향, layout
- **svg-matrix** — path geometry, SVG attribute, Figma plugin export markup

같은 Figma JSON을 두 repo가 각자 담당 레이어에서 처리하는 구조입니다.
