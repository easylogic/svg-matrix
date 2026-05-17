---
id: "052"
title: "adaptive flatten"
part: "Appendix B. Engine extras"
demo: "engine-adaptive-flatten"
---

# adaptive flatten

[016](./lesson-016.md) **uniform** flatten은 곡선마다 `t = k/n`을 **항상** 찍습니다. **Adaptive** flatten은 chord error가 **ε 이하**가 될 때까지 [068](./lesson-068.md) subdivide 후 재귀합니다 — 직선 구간은 점이 거의 없고, 휜 구간만 촘촘합니다.

<LessonDemo id="052" />

## 데모에서 볼 것

path:

```txt
M 40 320 C 120 40, 520 380, 600 120
```

- 회색 **stroke** — 원본 cubic  
- **회색 점** — `flattenPathSegments` (uniform, `uniform steps` 슬라이더)  
- **파란 점** — `flattenPathSegmentsAdaptive` (`tolerance` 슬라이더)  

readout 예:

```txt
uniform 17 pts (gray)  length=…
adaptive 9 pts (blue)  length=…
```

`tolerance`를 줄이면 파란 점이 늘고, `uniform steps`를 키우면 회색 점이 늘어납니다. 같은 시각 품질에서 **adaptive가 점 수를 줄이는** 경우가 많습니다 ([069](./lesson-069.md) flatness와 같은 멈춤 기하).

## API

### path 전체

```js
import { flattenPathSegmentsAdaptive, compareFlattenMethods } from "svg-matrix-core";

const poly = flattenPathSegmentsAdaptive(segments, { tolerance: 0.5 });
// M/L: 끝점만 · C/Q: adaptive · A: arcSegmentToCubics → C adaptive
```

### cubic 하나

```js
import { flattenCubicAdaptive } from "svg-matrix-core";

const points = [{ ...p0 }];
flattenCubicAdaptive(p0, p1, p2, p3, 0.5, points);
// points 배열에 in-out 누적 — 반환값 없음
```

`flattenQuadraticAdaptive` — [009](./lesson-009.md) Q segment 동일 패턴 (`engine.js`).

## 알고리즘 (cubic)

```txt
mid = B(½)
if distance(mid, chord P0→P3) ≤ ε:
  push P3; return
else:
  splitCubic (de Casteljau ½) → 왼쪽·오른쪽 재귀
```

[069](./lesson-069.md) `cubicFlatnessError`와 동일한 **중점–현 수직 거리** 검사입니다 (`distancePointToSegment`).

## uniform vs adaptive

| | [016](./lesson-016.md) uniform | **052 adaptive** |
|---|----------------|------------------|
| 멈춤 | 고정 `stepsPerCurve` / `stepsPerArc` | ε (tolerance) |
| 직선 `L` | 끝점 + 중간 샘플 없음 | **끝점만** (2점) |
| 점 개수 | 예측 가능 | 곡률·ε에 따라 변동 |
| 구현 | `index.js` `flattenPathSegments` | `engine.js` |

```js
import { compareFlattenMethods, flattenPathSegments } from "svg-matrix-core";

const stats = compareFlattenMethods(segments, {
  tolerance: 0.5,
  stepsPerCurve: 16
});
// {
//   uniformCount, adaptiveCount,
//   uniformLength, adaptiveLength   // polylineLength
// }
```

`compareFlattenMethods` — 데모 readout의 숫자 출처. length는 둘 다 polyline 근사이므로 ε·step에 따라 약간 다릅니다 ([017](./lesson-017.md)).

## 언제 쓰나

| 용도 | 이유 |
|------|------|
| fill hit · boolean | [015](./lesson-015.md) — 곡선 구간만 촘촘히 |
| path length / motion | [017](./lesson-017.md), [018](./lesson-018.md) — 같은 ε로 L 수렴 |
| offset · intersection | [077](./lesson-077.md), [075](./lesson-075.md) — flatten 품질 |
| export / GPU mesh | polygon 전처리 — 점 수↓ |

편집 **live preview**는 coarse uniform이 더 단순할 수 있고, **commit·export**에 adaptive를 쓰는 팀이 많습니다.

## ε 스케일

`tolerance`는 **world / user space px** (viewBox 단위)입니다. zoom·devicePixelRatio와 맞추려면 screen px → world 변환 후 ε를 넣습니다.

## Core API (`engine.js`)

| 함수 | 역할 |
|------|------|
| `flattenCubicAdaptive` | cubic → points 배열 누적 |
| `flattenQuadraticAdaptive` | quadratic |
| `flattenPathSegmentsAdaptive` | full segment graph |
| `compareFlattenMethods` | uniform vs adaptive 통계 |

re-export: `svg-matrix-core` `index.js`에서 import 가능.

## 관련

- [016](./lesson-016.md) · [068](./lesson-068.md) · [069](./lesson-069.md) · [065](./lesson-065.md) arc flatten 비교

## 오늘의 핵심

Adaptive = **같은 chord-error ε, 더 적은 점**. uniform step만 키우는 것과 달리 직선은 거의 샘플하지 않습니다. `compareFlattenMethods`로 데모처럼 점 수·length trade-off를 확인한 뒤 fill·length·boolean에 같은 `tolerance`를 고정하세요.
