---
id: "014"
title: "nonzero vs evenodd"
part: "Part 3. Fill rules"
demo: "fill-rule"
---

# nonzero vs evenodd

닫힌 path의 **안/밖**을 정하는 규칙이 `fill-rule`입니다. 단순 사각형에서는 같아 보이지만, **구멍(compound)**·**self-intersection**·**8자(bow-tie)** 에서 `nonzero`와 `evenodd` 결과가 갈립니다.

<LessonDemo id="014" />

## 데모에서 볼 것

```txt
M 160 80 L 480 80 L 480 340 L 160 340 Z
M 240 140 L 400 140 L 400 280 L 240 280 Z
```

- 바깥 rect + 안쪽 rect (두 `M` subpath)  
- toolbar **fill-rule**: `nonzero` / `evenodd`  
- 포인터 이동 — **초록** = inside, **빨강** = outside (`pointInPath`, `stepsPerCurve: 16`)  
- readout **winding** — coarse flatten(`stepsPerCurve: 1`)으로 빠르게 표시  

**구멍 중앙** `(320, 210)` 근처:

| rule | inside |
|------|--------|
| `nonzero` | outer CCW + inner CW → winding 합이 0이 아니면 **안** (테스트: inner에서 `insideNonZero: true`) |
| `evenodd` | crossing 홀수 겹침 → **밖** (`insideEvenOdd: false`) |

`evenodd`로 구멍을 뚫으려면 Figma **Subtract** export도 `fill-rule="evenodd"`를 씁니다 ([figma-bridge](../../svg-matrix-core/src/figma-bridge.js)).

## nonzero — winding number

점 `P`에서 polygon edge를 따라 **signed crossing**을 세면 winding `w`가 됩니다.

```js
import { windingNumber, pointInPolygon } from "svg-matrix-core";

const polygon = flattenPathSegments(subpath, { stepsPerCurve: 16 });
const w = windingNumber(point, polygon);

const insideNonZero = w !== 0;           // SVG nonzero
// pointInPolygon(point, polygon) 동일
```

| `w` | 의미 (단순 CCW 외곽) |
|-----|----------------------|
| `0` | 바깥 |
| `+1` | 한 번 감쌈 (CCW) |
| `-1` | 한 번 감쌈 (CW) |

방향은 subpath winding에 따라 부호가 바뀝니다. [073](./lesson-073.md) `signedPolygonArea`로 CCW/CW를 볼 수 있습니다.

## evenodd — parity

오른쪽으로 수평 ray를 쏴 **edge crossing 횟수**가 홀수면 inside.

```js
import { rayCrossingCount, evenoddParityFromRayCast } from "svg-matrix-core";

const crossings = rayCrossingCount(point, polygon);
const insideEvenOdd = crossings % 2 === 1;

evenoddParityFromRayCast(point, polygon);  // 동일 판정 — [084](./lesson-084.md) 픽셀
```

## path 전체 — `classifyPointInPath`

```js
import { classifyPointInPath, pointInPath, parsePathD } from "svg-matrix-core";

const segments = parsePathD(pathD);
const result = classifyPointInPath(point, segments, "evenodd", {
  stepsPerCurve: 16
});
// {
//   inside, fillRule,
//   winding, crossings,        // subpath 합산
//   insideNonZero, insideEvenOdd,
//   subpathCount
// }

pointInPath(point, segments, "nonzero");  // → result.inside 만
```

파이프라인:

```txt
segments → segmentsToSubpaths (M마다 분리)
         → 각 subpath flattenPathSegments → polygon
         → winding / crossings 합산 → fillRule에 따라 inside
```

[003](./lesson-003.md) compound path · [016](./lesson-016.md) flatten 품질이 fill hit 정확도를 좌우합니다.

## bow-tie (8자) — 규칙이 갈리는 예

```txt
M 0 0 L 40 40 L 40 0 L 0 40 Z
```

중앙 lobe `(5, 5)`:

```js
const lobe = classifyPointInPath({ x: 5, y: 5 }, parsePathD(d), "evenodd");
// crossings === 2 → inside === false
```

| rule | 중앙 lobe |
|------|-----------|
| `evenodd` | **밖** (crossing 2 = 짝수) |
| `nonzero` | winding에 따라 **안**일 수 있음 |

[028](./lesson-028.md) boolean·self-intersect path에서 같은 차이가 납니다.

## Canvas / SVG / 브라우저

```js
ctx.fill(path2d, "evenodd");
```

```xml
<path fill-rule="evenodd" d="..." />
```

`Path2D` / `SVGGeometryElement.isPointInFill()` — `fill-rule` 인자 동일.

## 래스터 · boolean

| 주제 | 연결 |
|------|------|
| scanline fill | [029](./lesson-029.md) — y 고정 후 parity flip |
| 픽셀 parity | [084](./lesson-084.md) `evenoddParityFromRayCast` |
| point boolean | `pointInPathBoolean` — A/B 각각 nonzero 후 set op |
| Figma boolean | SUBTRACT/EXCLUDE → `evenodd` |

```js
import { pointInPathBoolean } from "svg-matrix-core";

pointInPathBoolean(point, outer, inner, "subtract");  // in A && !in B
```

## Core API

| 함수 | 역할 |
|------|------|
| `windingNumber`, `pointInPolygon` | polygon + nonzero |
| `rayCrossingCount`, `evenoddParityFromRayCast` | polygon + parity |
| `segmentsToSubpaths` | `M` 분리 |
| `classifyPointInPath`, `pointInPath` | segment graph + fill-rule |
| `signedPolygonArea` | winding 방향 ([073](./lesson-073.md)) |

## 관련

- [015](./lesson-015.md) fill hit · [027](./lesson-027.md) compound · [028](./lesson-028.md) boolean

## 오늘의 핵심

fill은 **stroke와 다른 문제**입니다 — flatten polygon + winding 또는 parity. 구멍·8자에서는 `fill-rule` 선택이 제품 동작을 바꾸므로, hit test·export·Figma boolean을 **같은 rule**로 맞추세요.
