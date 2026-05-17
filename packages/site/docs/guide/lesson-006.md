---
id: "006"
title: "stroke align과 outline 개념"
part: "Part 2. Stroke geometry"
demo: "stroke-align"
---

# stroke align과 outline 개념

Figma는 **inside / center / outside** stroke를 고릅니다. SVG 1.1 기본 stroke는 항상 **path 중심선**을 따라 그립니다. “테두리만 안쪽”은 CSS `border`가 아니라 **offset + clip** geometry 문제입니다.

<LessonDemo id="006" />

## 데모에서 볼 것

```txt
M 120 120 L 320 120 L 320 280 L 120 280 Z
```

| mode | 화면 |
|------|------|
| **center** | 파란 굵은 stroke — SVG 기본 (중심선 기준 반반) |
| **inside** / **outside** | 주황 outline 레이어 + readout — “SVG 속성 한 줄로 안 됨” |

- 연한 fill + 얇은 회색 — fill boundary 참고  
- toolbar **conceptual align**: center / inside / outside  

inside·outside는 **개념 설명**이며, 실제 Figma export는 [figma-bridge](../../svg-matrix-core/src/figma-bridge.js) `figmaStrokeAlignToSvgMarkup` 패턴을 봅니다.

## center (SVG native)

```txt
        ┌──────── fill boundary
════════╪════════  ← stroke half outside
        │████████│
════════╪════════  ← stroke half inside
        └────────
```

```xml
<path d="..." fill="..." stroke="..." stroke-width="16" />
```

- [004](./lesson-004.md) hit: 중심선 ± `strokeWidth/2`  
- [005](./lesson-005.md) join/cap: 중심선 vertex에서 적용  

## inside (Figma `INSIDE`)

SVG에 `stroke-align: inside` 없음. 흔한 패턴:

```txt
1. clipPath = fill boundary (원본 d)
2. stroke-width × 2
3. clip-path로 바깥 절반 잘림 → 안쪽만 보임
```

```js
import { figmaStrokeAlignToSvgMarkup } from "svg-matrix-core";

const { markup, defs, align } = figmaStrokeAlignToSvgMarkup({
  pathD: "M 120 120 L 320 120 L 320 280 L 120 280 Z",
  stroke: { weight: 16, align: "INSIDE", color: "#2563eb", join: "ROUND" }
});
// defs: clipPath, markup: clipped doubled stroke
```

## outside (Figma `OUTSIDE`)

| 접근 | 설명 |
|------|------|
| offset path | normal 방향으로 path 밀기 → 바깥 edge에 stroke ([077](./lesson-077.md)) |
| under-fill | fill 아래에 더 굵은 stroke (근사) |
| double path | 바깥 contour만 stroke |

```js
import { offsetPathD } from "svg-matrix-core";

const { d: outlineD, pointCount } = offsetPathD(
  "M 120 120 L 320 120 L 320 280 L 120 280 Z",
  8,
  { closed: true, flattenOptions: { stepsPerCurve: 16 } }
);
// polyline offset — 곡선은 flatten 근사
```

acute corner에서 offset은 cusp·self-intersect ([078](./lesson-078.md)) — outside stroke 품질 한계.

## 비교 표

| | Figma | SVG 1.1 | core |
|---|-------|---------|------|
| center | CENTER | 기본 stroke | 단일 `<path>` |
| inside | INSIDE | ✗ | clip + 2× width |
| outside | OUTSIDE | ✗ | offset / layer trick |

## 편집기 설계

```txt
저장:     centerline path (변하지 않음)
preview:  align에 따라 clip/offset 레이어 합성
export:   figmaStrokeAlignToSvgMarkup 또는 단순 center stroke
```

fill + stroke align 동시에 쓰면 [014](./lesson-014.md) fill-rule과 clip 순서를 정합니다.

## Core API

| 함수 | 역할 |
|------|------|
| `figmaStrokeAlignToSvgMarkup` | INSIDE clip / CENTER / OUTSIDE note |
| `figmaStrokeToSvgAttributes` | join, cap, width |
| `offsetPathD`, `offsetPolyline` | outside·outline 근사 |
| `offsetPointOnCubic` | 곡선 구간 ([077](./lesson-077.md)) |

## 관련

- [005](./lesson-005.md) · [004](./lesson-004.md) · [077](./lesson-077.md) · [078](./lesson-078.md) · [040](./lesson-040.md) Figma bridge

## 오늘의 핵심

stroke align ≠ `stroke-width` 조절. **center는 중심선**, inside/outside는 **clip·offset geometry**입니다. Figma parity는 `figmaStrokeAlignToSvgMarkup` 또는 offset 파이프라인으로 맞춥니다.
