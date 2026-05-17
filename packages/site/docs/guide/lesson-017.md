---
id: "017"
title: "path length"
part: "Part 4. Path sampling"
demo: "path-length"
---

# path length

path의 **총 길이 L**은 flatten polyline의 edge 길이 합입니다. dash offset, textPath `startOffset`, motion `offset-distance`, SMIL `animateMotion`이 모두 이 스칼라(또는 그 비율)에 묶입니다.

<LessonDemo id="017" />

## 정의 (core)

```js
import { pathLength, flattenPathSegments, polylineLength, parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 60 300 C 160 80, 480 340, 580 120");
const L = pathLength(segments, { stepsPerCurve: 24 });
// = polylineLength(flattenPathSegments(segments, { stepsPerCurve: 24 }))
```

```txt
L = Σ |pᵢ − pᵢ₋₁|
```

**곡선의 해석적 호장**이 아니라 **샘플링 근사**입니다. `stepsPerCurve`↑ → L이 수렴.

## 데모

- toolbar **distance along path** — 0 ~ L ([018](./lesson-018.md)과 동일 데모)  
- readout: `path length=…`, `distance=…`, `point=…`, `tangent=…`  
- 주황 점 — `pointAtPathLength` 결과  

018 강의는 “거리 → 점·접선”에 초점, 여기서는 **L 자체**와 sampling 의존성.

## SVG `pathLength` attribute

```xml
<path d="..." pathLength="100"/>
```

브라우저·SMIL이 **실제 L과 무관하게** 0–100으로 정규화할 때 사용. 수학 엔진의 `pathLength(segments)`와 **다른 개념** — 이름만 같음.

## 정확도 올리기

| 방법 | 효과 |
|------|------|
| `stepsPerCurve` ↑ | 단순, 느려짐 |
| [052](./lesson-052.md) adaptive flatten | 같은 ε에 점↓ |
| [097](./lesson-097.md) native `getTotalLength()` | DOM path 1개, 편집기는 segment graph |

## 연결

| 용도 | 강의 |
|------|------|
| s → point | [018](./lesson-018.md) `pointAtPathLength` |
| 균일 속도 | [095](./lesson-095.md) `buildArcLengthLookup` — L 기반 재매개화 |
| dash phase | [051](./lesson-051.md) `dashPatternPhaseAtLength` |
| draw-on | [091](./lesson-091.md) `strokeDashDrawKeyframes(L)` |
| textPath 50% | [063](./lesson-063.md) — `0.5 * L` |
| JS motion | [094](./lesson-094.md) |

css-matrix **Motion path** — 시간 easing은 별도, **공간** 좌표는 L.

## 함정

- segment마다 step이 같아도 **곡률 큰 구간**에서 L 오차 큼 → adaptive  
- compound path — **subpath별** L 합산 vs 전체 하나의 L (제품 정책)  
- bake transform([080](./lesson-080.md)) 후 L 계산 — 좌표계 통일  

## Core API

- `pathLength`, `polylineLength`, `flattenPathSegments`
- `strokeDashIntervals`, `dashPatternPhaseAtLength` — [051](./lesson-051.md)

## 관련

- [016](./lesson-016.md) flatten · [018](./lesson-018.md) point at length · [097](./lesson-097.md) native API

## 오늘의 핵심

L = geometry + sampling 결과 하나. step·adaptive를 바꾸면 L도 바뀝니다 — dash·motion·text offset을 캐시할 때 같은 옵션을 고정하세요.
