---
id: "072"
title: "G¹ smooth — S와 T"
part: "Part 15. Curve calculus"
demo: "geom-smooth"
---

# G¹ smooth — S와 T

`S` / `T` path 명령은 **이전 control을 anchor 기준으로 반사**해 **접선 방향(G¹)** 이 맞도록 만드는 축약입니다. [010](./lesson-010.md) grammar, 여기서는 **수식과 편집기**에 초점을 둡니다.

<LessonDemo id="072" />

## G⁰ vs G¹

| | 조건 |
|---|------|
| G⁰ | segment 끝에서 **위치** 연속 (같은 anchor) |
| G¹ | 위치 + **접선 방향** 연속 (1차 미분 방향 같음) |

`S`/`T`는 G¹을 **저장 형식**으로 압축합니다. G²(곡률 연속)까지는 보장하지 않습니다.

## reflect 규칙 — 한 줄

이전 cubic의 `cp2` = `Pc`, 공유 anchor = `Pa`, 다음 segment의 `cp1` = `P1`:

```txt
P1 = 2·Pa − Pc
```

```js
import { reflectControlForSmoothContinuation } from "svg-matrix-core";

const cp1_auto = reflectControlForSmoothContinuation(anchor, previousCp2);
// { x: 2*anchor.x - previousCp2.x, y: ... }
```

기하: `Pa`가 `Pc`와 `cp1_auto`의 **중점** — `Pc—Pa—cp1_auto` 직선, `Pa`에서 접선 방향 일치.

## `parsePathD`에서 `S` 전개

```js
import { parsePathD } from "svg-matrix-core";

// … C … 이후
// S cpx cpy, x y  →  내부 C segment:
//   cp1 = reflect(current, lastCubicControl)
//   cp2 = (cpx, cpy)
//   to  = (x, y)
```

`index.js` 파서 — `lastCubicControl` 없으면 `cp1 = current`(degenerate).

`T`는 quadratic 버전 — `lastQuadraticControl` 반사 ([010](./lesson-010.md)).

## 데모에서 볼 것

- **회색** — 이전 segment 끝 control `c1`  
- **주황** — `reflectControlForSmoothContinuation(anchor, c1)` = 자동 `cp1`  
- **파란** — anchor, **파란 curve** — 두 segment가 **꺾임 없이** 이어짐  
- readout: `2·anchor − cpPrev`  

handle을 anchor만 움직여도 반사된 cp1이 따라가면 G¹ 유지 — 펜 tool·프리드로우 패턴.

## 편집기 구현

```js
// 사용자가 anchor Pa 드래그
segments = updatePathHandle(segments, "a:2", newPa);
// 이웃 C segment의 cp1/cp2 + syncPathEndpoints ([023](./lesson-023.md))

// S로 저장된 path를 편집할 때:
// 1) parsePathD → 전부 explicit C
// 2) 또는 편집 중 S 플래그 유지 + reflect on drag
```

[024](./lesson-024.md) path editor는 explicit `C`만 다룹니다. export 시 `pathDFromSegments`가 `S`로 다시 압축하는 것은 **선택적 optimizer** (SVGO 계열).

## Core API

- `reflectControlForSmoothContinuation` — `geometry.js`
- `parsePathD` — `S`/`T` → `C`/`Q` 전개 — `index.js`

## 관련

- [010](./lesson-010.md) S/T grammar · [070](./lesson-070.md) tangent/κ at join

## 오늘의 핵심

smooth = **control 반사 한 함수**. 파서·편집기·필기 엔진이 `reflectControlForSmoothContinuation`을 공유하면 G¹이 깨지지 않습니다.
