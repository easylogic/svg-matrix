---
id: "060"
title: "stroke align export"
part: "Part 13. Figma ↔ SVG (deep)"
demo: "figma-stroke-align-export"
---

# stroke align export

Figma **INSIDE / OUTSIDE** stroke를 SVG 1.1에서 재현합니다. CENTER만 native입니다.

<LessonDemo id="060" />

## 데모에서 볼 것

```txt
pathD = M 220 120 L 420 120 L 320 300 Z
```

- **align**: CENTER | INSIDE | OUTSIDE  
- INSIDE: **2× stroke-width** + `clip-path` on stroke layer  
- readout: `mapped.align`, `note`, `markup`  

```js
import { figmaStrokeAlignToSvgMarkup } from "svg-matrix-core";

figmaStrokeAlignToSvgMarkup({
  pathD,
  stroke: { weight: 8, align: "INSIDE", color, cap: "ROUND", join: "ROUND" },
  clipId: "align-clip"
});
```

## vs [006](./lesson-006.md)

| | 006 | 060 |
|---|-----|-----|
| 초점 | 렌더·hit 개념 | **export 문자열** |
| API | 동일 계열 | `figmaStrokeAlignToSvgMarkup` |

## Core API

| 함수 | 역할 |
|------|------|
| `figmaStrokeAlignToSvgMarkup` | defs + clip + note |

## 관련

- [006](./lesson-006.md) · [041](./lesson-041.md) · [005](./lesson-005.md)

## 오늘의 핵심

INSIDE stroke = **clip + 두꺼운 stroke** 패턴 — attribute 한 줄로 끝나지 않습니다.
