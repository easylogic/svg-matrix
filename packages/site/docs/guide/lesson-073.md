---
id: "073"
title: "shoelace signed area"
part: "Part 15. Curve calculus"
demo: "geom-shoelace"
---

# shoelace signed area

닫힌 polygon의 **signed area**(부호 있는 면적)는 shoelace(신발끈) 공식으로 O(n)에 구합니다. **winding 방향**(CCW/CW)과 면적 UI·hole 처리·ear clip의 부호에 직결됩니다.

<LessonDemo id="073" />

## 공식

꼭짓점 `(x0,y0)…(xn-1,yn-1)` (닫힌 ring):

```txt
A = (1/2) Σᵢ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)
```

```js
import { shoelaceArea } from "svg-matrix-core";

const polygon = [
  { x: 180, y: 80 },
  { x: 460, y: 100 },
  { x: 420, y: 320 },
  { x: 200, y: 300 }
];

const signed = shoelaceArea(polygon);
const absArea = Math.abs(signed);
```

| `signed` | 해석 (y-down SVG 좌표) |
|----------|------------------------|
| > 0 | 한 방향 winding (보통 CCW 관례) |
| < 0 | 반대 winding |
| ≈ 0 | degenerate / collinear |

데모 readout: `shoelaceArea = … (signed)`, `|area| = …`.

## 곡선 path는 polygon으로

`d`에 곡선이 있으면 먼저 flatten:

```js
import { parsePathD, flattenPathSegments, shoelaceArea } from "svg-matrix-core";

const points = flattenPathSegments(parsePathD(pathD), { stepsPerCurve: 24 });
const area = shoelaceArea(points);
```

정확 면적이 필요하면 adaptive flatten([052](./lesson-052.md)) 또는 해석 적분 — 편집기 UI “면적” 표시는 flatten 근사로 충분한 경우가 많습니다.

## 어디에 쓰이나

| 용도 | 강의 / API |
|------|------------|
| nonzero winding 판정 보조 | [014](./lesson-014.md), [025](./lesson-025.md) |
| hole 방향 맞추기 | [100](./lesson-100.md) `triangulatePolygonWithHoles` — hole이 outer와 같은 부호면 `reverse` |
| ear clip winding | [083](./lesson-083.md) `earClipTriangulate` — `shoelaceArea >= 0` → CCW 가정 |
| compound path | [026](./lesson-026.md) outer/hole CW·CCW |
| boolean 전처리 | [028](./lesson-028.md) — polygon 방향 정규화 |

```js
// 100 내부 (개념)
const outerArea = shoelaceArea(outer);
const holeRing =
  shoelaceArea(hole) * outerArea > 0 ? hole.slice().reverse() : hole.slice();
```

## vs `classifyPointInPath`

| | shoelace | classify |
|---|----------|----------|
| 질문 | “이 polygon 면적·방향?” | “이 **점**이 안/밖?” |
| 입력 | 닫힌 vertex ring | segment[] + point |

둘 다 winding 계열이지만 **용도가 다릅니다**.

## 데모에서 볼 것

- 파란 **사다리꼴** polygon  
- readout signed area — 꼭짓점 순서를 바꾸면(개념) 부호가 뒤집힘  

## Core API

- `shoelaceArea` — `geometry.js`

## 관련

- [026](./lesson-026.md) compound · [083](./lesson-083.md) ear · [100](./lesson-100.md) holes

## 오늘의 핵심

면적·방향 = **polygon algebra**. 곡선은 flatten 후 shoelace — hole·triangulation 파이프의 숨은 의존성입니다.
