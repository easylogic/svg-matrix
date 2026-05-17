---
id: "025"
title: "winding vs ray casting"
part: "Part 7. Fill & winding deep dive"
demo: "winding-compare"
---

# winding vs ray casting

[014](./lesson-014.md)에서 `nonzero`와 `evenodd` **규칙**을 봤다면, 여기서는 **두 규칙이 어떻게 계산되는지** — winding number vs ray crossing — 를 한 화면에서 비교합니다.

<LessonDemo id="025" />

## 데모에서 볼 것

bow-tie path ([014](./lesson-014.md) 테스트와 동일):

```txt
M 0 0 L 40 40 L 40 0 L 0 40 Z
```

- toolbar **fill-rule** — `nonzero` / `evenodd` (활성 fill 색)  
- **포인터 이동** — 초록 inside / 빨강 outside  
- readout **네 값 동시 표시**:

```txt
winding=…  crossings=…
nonzero inside=…  evenodd inside=…
active rule (…) inside=…
```

중앙 lobe `(20, 20)` 근처: `insideNonZero`와 `insideEvenOdd`가 **다를 수 있음** — [027](./lesson-027.md)과 같은 기하.

## `classifyPointInPath` 한 번에

```js
import { classifyPointInPath, parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 0 0 L 40 40 L 40 0 L 0 40 Z");
const c = classifyPointInPath({ x: 20, y: 20 }, segments, "nonzero", {
  stepsPerCurve: 8
});

c.winding;         // subpath 합산 — nonzero용
c.crossings;       // ray crossing 합 — evenodd용
c.insideNonZero;   // winding !== 0
c.insideEvenOdd;   // crossings % 2 === 1
c.inside;          // 선택한 fillRule 결과
```

| 규칙 | inside 조건 | 데모 필드 |
|------|-------------|-----------|
| **nonzero** | `winding !== 0` | `insideNonZero` |
| **evenodd** | `crossings % 2 === 1` | `insideEvenOdd` |

규칙은 **다르고**, winding/ray는 **측정 방식**이 다릅니다. `classifyPointInPath`가 둘 다 계산합니다.

## winding number

polygon edge를 지날 때 ±1 누적 (방향 있음).

```js
import { windingNumber, pointInPolygon } from "svg-matrix-core";

const poly = flattenPathSegments(subpath, { stepsPerCurve: 16 });
const w = windingNumber(point, poly);
pointInPolygon(point, poly);  // w !== 0
```

CCW outer → 보통 `|w| ≥ 1`. compound에서 inner가 반대 방향이면 상쇄 ([026](./lesson-026.md)).

## ray casting (crossing parity)

오른쪽으로 수평 ray — edge와 교차할 때마다 count.

```js
import { rayCrossingCount, evenoddParityFromRayCast } from "svg-matrix-core";

const n = rayCrossingCount(point, poly);
const inside = n % 2 === 1;
evenoddParityFromRayCast(point, poly);  // 동일
```

[030](./lesson-030.md) scanline은 **고정 y**에서 이 crossing을 훑는 시각화입니다.

## 언제 값이 갈라지나

| shape | nonzero vs evenodd |
|-------|-------------------|
| 단순 convex | 보통 동일 |
| compound hole | [026](./lesson-026.md) — winding 방향 vs parity |
| bow-tie / star | [027](./lesson-027.md) — 중앙 lobe |
| curve path | flatten step에 따라 근사 ([015](./lesson-015.md)) |

## Core API

| 함수 | 역할 |
|------|------|
| `classifyPointInPath` | winding + crossings + both inside |
| `windingNumber`, `pointInPolygon` | polygon + nonzero |
| `rayCrossingCount`, `evenoddParityFromRayCast` | polygon + parity |
| `flattenPathSegments` | curve → polygon |

## 관련

- [014](./lesson-014.md) · [026](./lesson-026.md) · [027](./lesson-027.md) · [030](./lesson-030.md) · [084](./lesson-084.md)

## 오늘의 핵심

nonzero/evenodd는 **규칙**, winding/ray는 **알고리즘**입니다. 편집기·hit test는 `classifyPointInPath`로 네 값을 함께 보고, export fill-rule과 맞는 `inside*`를 선택하세요.
