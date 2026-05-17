---
id: "027"
title: "self-intersection"
part: "Part 7. Fill & winding deep dive"
demo: "self-intersect"
---

# self-intersection

path가 **스스로 교차**하면 “안/밖”이 직관과 어긋날 수 있습니다. 같은 점도 [014](./lesson-014.md) `fill-rule`에 따라 inside가 바뀝니다. compound 구멍([026](./lesson-026.md))과 달리, **한 subpath 안**에서 edge가 겹칩니다.

<LessonDemo id="027" />

## 데모에서 볼 것

5각 **별** (self-intersecting):

```txt
M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z
```

- toolbar **fill-rule**: `nonzero` / `evenodd`  
- **포인터 이동** — inside 초록 / outside 연한 배경  
- readout: `winding`, `crossings`, `inside (rule)=…`  

별 **중앙 오각형**·**팔 교차부** 근처를 `nonzero` ↔ `evenodd`로 바꿔 가며 클릭해 보세요. 한 점에서 `insideNonZero !== insideEvenOdd`인 영역이 있습니다.

## 두 규칙 (복습)

| | nonzero | evenodd |
|---|---------|---------|
| 판정 | `winding ≠ 0` | `crossings % 2 === 1` |
| 별 중앙 | winding 누적에 따라 **안**일 수 있음 | **밖**인 경우 많음 (직관적 “구멍”) |
| 8자 bow-tie 중앙 | 상황에 따라 **안** | **밖** (테스트 고정) |

```js
import { classifyPointInPath, parsePathD } from "svg-matrix-core";

const segments = parsePathD(starD);
const c = classifyPointInPath(point, segments, "evenodd", {
  stepsPerCurve: 16
});

c.inside;           // 선택한 rule
c.insideNonZero;    // 참고
c.insideEvenOdd;
c.winding;
c.crossings;
```

## bow-tie (8자) — 테스트 path

```txt
M 0 0 L 40 40 L 40 0 L 0 40 Z
```

```js
const lobe = classifyPointInPath({ x: 5, y: 5 }, parsePathD(d), "evenodd");
// crossings === 2 → inside === false
```

[014](./lesson-014.md) fill.test와 동일 — **교차 루프 한가운데**는 evenodd에서 밖.

## 왜 달라지나

```txt
        ╲   ╱
         ╲ ╱   ← edge가 두 번 지나감
          X
         ╱ ╲
        ╱   ╲
```

- **winding**: 방향 있음 edge마다 ±1 — 루프가 겹치면 합이 0이 아닐 수 있음  
- **evenodd**: ray crossing **횟수**만 — 짝수면 밖  

self-intersect는 “버그”가 아니라 **규칙 선택** 문제입니다.

## flatten · hit

`classifyPointInPath`는 [016](./lesson-016.md) `flattenPathSegments`로 polygon을 만든 뒤 [014](./lesson-014.md) winding/ray를 씁니다. 곡선이 있으면 `stepsPerCurve`를 키워야 교차 근처 hit이 안정적입니다 ([015](./lesson-015.md)).

## 편집기 · export · boolean

| 상황 | 권장 |
|------|------|
| 별·리본·레이스 | `evenodd` (Figma SUBTRACT/EXCLUDE도 often evenodd) |
| 단일 외곽 실선 | `nonzero` |
| [028](./lesson-028.md) boolean 전 | 결과 path에 **어떤 rule로 fill할지** 먼저 고정 |
| [102](./lesson-102.md) mesh | evenodd raster + triangulation |

```js
import { figmaBooleanToFillRule } from "svg-matrix-core"; // figma-bridge
// SUBTRACT / EXCLUDE → evenodd
```

[026](./lesson-026.md)은 **여러 subpath** 구멍, [027](./lesson-027.md)은 **한 subpath** 교차 — fill-rule 혼동하지 마세요.

## Core API

| 함수 | 역할 |
|------|------|
| `classifyPointInPath` | `inside` + `winding` + `crossings` + both rules |
| `pointInPath` | boolean만 |
| `segmentsToSubpaths` | 별은 보통 subpath 1개 |
| `evenoddParityFromRayCast` | polygon 단위 ([084](./lesson-084.md)) |

## 관련

- [014](./lesson-014.md) · [025](./lesson-025.md) · [026](./lesson-026.md) · [028](./lesson-028.md) · [084](./lesson-084.md) · [100](./lesson-100.md)

## 오늘의 핵심

self-intersect path는 **nonzero vs evenodd를 반드시 제품에서 선택**해야 합니다. 별·8자는 evenodd가 “구멍” 직관에 가깝고, boolean·Figma export와 [028](./lesson-028.md) 전에 rule을 고정하세요.
