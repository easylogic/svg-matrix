---
id: "074"
title: "segment intersection"
part: "Part 16. Intersection & proximity"
demo: "geom-segment-ix"
---

# segment intersection

두 **선분**의 교차는 스냅·trim·가이드·boolean 폴리곤의 **원자 연산**입니다. 무한 직선 교차와 달리 `t`, `u ∈ [0,1]`로 “끝점 사이인가”를 동시에 검사합니다.

<LessonDemo id="074" />

## 매개변수 형식

선분 A: `A0 + t(A1−A0)`, 선분 B: `B0 + u(B1−B0)`.

```txt
t = 0 → A0,  t = 1 → A1
u = 0 → B0,  u = 1 → B1
```

```js
import { lineSegmentIntersection } from "svg-matrix-core";

const hit = lineSegmentIntersection(a0, a1, b0, b1);
// null | { point: {x,y}, t, u }
```

| 반환 | 의미 |
|------|------|
| `null` | 평행·공선·연장선만 교차 |
| `{ point, t, u }` | 교차점 + 두 선분 위 위치 |

**내부 교차**는 `0 ≤ t ≤ 1` 이고 `0 ≤ u ≤ 1` (core는 `EPSILON` 여유).

## 구현 요지

```txt
denom = dax·dby − day·dbx
t = ((B0−A0) × db) / denom   (2D cross 형태)
```

`denom ≈ 0` → 평행. 데모 readout의 `parallel — no intersection`이 이 경우입니다.

## broad phase

N개 선분 전부 쌍 검사는 O(N²). 편집기는 보통:

1. pointer 주변 bbox  
2. segment bbox overlap  
3. 그 후에만 `lineSegmentIntersection`  

[008](./lesson-008.md) cubic bbox로 curve를 감싼 뒤, flatten된 chord끼리 074를 호출하는 패턴도 흔합니다.

## 곡선과의 관계

| 단계 | 연산 |
|------|------|
| cubic ∩ cubic | subdivide → chord가 충분히 flat → **074** |
| line ∩ cubic | 샘플 + refine ([075](./lesson-075.md)) |
| stroke hit | closest point ([076](./lesson-076.md)), 교차 아님 |

## 데모에서 볼 것

- 파란·초록 **X자** 두 선분 — 교차 시 주황 점  
- readout: `(x,y) t=… u=…` — `t`,`u`가 0~1인지  
- 선분을 평행에 가깝게 바꾸면 (코드 고정이면) `parallel` 메시지 — 개념 이해용  

## Core API

- `lineSegmentIntersection` — `geometry.js`

## 다음

- [075](./lesson-075.md) line ∩ cubic · cubic ∩ cubic  
- [096](./lesson-096.md) cubic–cubic 전용 강의  

## 오늘의 핵심

곡선 문제의 말단은 **선분 교차**입니다. `t`,`u`를 반환해 trim·스냅이 “어느 segment의 어디”인지 알 수 있게 하세요.
