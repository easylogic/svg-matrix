---
id: "042"
title: "boolean operations export"
part: "Part 10. Figma ↔ SVG bridge"
demo: "figma-boolean"
---

# boolean operations export

Figma `UNION` / `SUBTRACT` / `INTERSECT` / `EXCLUDE`는 export 시 **compound `d` + fill-rule** preset입니다. [028](./lesson-028.md) 집합 연산과 개념이 같고, 실무 boolean geometry는 Clipper 등이 별도입니다.

<LessonDemo id="042" />

## 데모에서 볼 것

- **파란** rect A, **주황** rect B  
- **초록** merged path — toolbar boolean op  
- readout: `UNION → fill-rule=nonzero` + merged `<path>` markup  

```txt
pathA: M 120 140 L 320 140 L 320 300 L 120 300 Z
pathB: M 220 180 L 420 180 L 420 340 L 220 340 Z
```

## API

```js
import {
  figmaBooleanPathsToSvg,
  figmaBooleanToFillRule,
  FIGMA_BOOLEAN_MAP
} from "svg-matrix-core";

const result = figmaBooleanPathsToSvg(
  [{ d: pathA }, { d: pathB }],
  "SUBTRACT"
);
// { d, fillRule, svg: "<path d=\"…\" fill-rule=\"evenodd\" …>" }

figmaBooleanToFillRule("SUBTRACT"); // "evenodd"
```

## FIGMA_BOOLEAN_MAP

| Figma | export fill-rule | 의미 |
|-------|------------------|------|
| UNION | `nonzero` | 합집합 compound |
| SUBTRACT | `evenodd` | A − B (hole 패턴) |
| INTERSECT | `nonzero` | 교집합 |
| EXCLUDE | `evenodd` | 대칭차 (XOR 스타일) |

```js
FIGMA_BOOLEAN_MAP.forEach((row) => {
  console.log(row.figma, row.fillRule, row.svg);
});
```

## vs [028](./lesson-028.md)

| | `pointInPathBoolean` | `figmaBooleanPathsToSvg` |
|---|----------------------|---------------------------|
| 용도 | 런타임 hit / preview | **export 문자열** |
| 결과 | boolean per point | single `d` + rule |
| geometry | sampling | path concat (단순) |

편집기에서 **진짜** boolean path가 필요하면 flatten + Clipper → 새 `d`.

## Core API

| 함수 | 역할 |
|------|------|
| `figmaBooleanPathsToSvg` | paths + op → `{ d, fillRule, svg }` |
| `figmaBooleanToFillRule` | op → rule |
| `FIGMA_BOOLEAN_MAP` | 표 데이터 |

## 관련

- [026](./lesson-026.md) compound · [027](./lesson-027.md) self-intersect · [028](./lesson-028.md)

## 오늘의 핵심

Figma boolean UI = **export preset** + fill-rule. SUBTRACT/EXCLUDE는 often `evenodd` — [026](./lesson-026.md) hole과 맞춰 검증하세요.
