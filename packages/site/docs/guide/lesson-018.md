---
id: "018"
title: "point at length와 tangent"
part: "Part 4. Path sampling"
demo: "path-point"
---

# point at length와 tangent

총 길이 [017](./lesson-017.md) `L`이 있으면, **거리 s ∈ [0, L]**에서의 점과 접선을 묻습니다. textPath 글자 배치, 화살표 방향, motion path 위치가 같은 sampling입니다.

<LessonDemo id="018" />

## API

```js
import { pointAtPathLength, pathLength, parsePathD } from "svg-matrix-core";

const segments = parsePathD("M 60 300 C 160 80, 480 340, 580 120");
const total = pathLength(segments, { stepsPerCurve: 24 });

const sample = pointAtPathLength(segments, total * 0.35, {
  stepsPerCurve: 24
});
// {
//   point: { x, y },
//   tangent: { x, y }   // 단위 벡터 — flatten edge 방향
// }
```

내부: `flattenPathSegments` → `pointAtPolylineLength(polyline, s)`.

### polyline 위 보간

```txt
s가 edge i 안이면:
  point = lerp(pᵢ₋₁, pᵢ, t)
  tangent = normalize(pᵢ − pᵢ₋₁)
```

## 데모 (path-length / path-point 공용)

- **distance along path** 슬라이더 — s 변경  
- 주황 **marker** — `sample.point`  
- readout: `tangent=(tx, ty)` — 다음 점 방향  

`stepsPerCurve`가 작으면 tangent가 **들쭉** — [016](./lesson-016.md)과 같이 step↑ 또는 adaptive.

## 회전에 쓰기

```js
const angle = Math.atan2(sample.tangent.y, sample.tangent.x);
// SVG: transform={`rotate(${deg} ${sample.point.x} ${sample.point.y})`}
```

[090](./lesson-090.md) SMIL `rotate="auto"` — 브라우저가 동일 질문을 내부 처리.

## textPath · motion

| 용도 | 선언 | 수학 |
|------|------|------|
| 텍스트沿 path | `<textPath startOffset="40">` 또는 `50%` | s → point, tangent → glyph rotate ([063](./lesson-063.md)) |
| SMIL | `<animateMotion>` | s(t) — 시간은 css-matrix |
| CSS | `offset-path` + `offset-distance` ([092](./lesson-092.md)) | 동일 |
| JS preview | [094](./lesson-094.md) `sampleMotionAlongPath` | progress↔s + LUT [095](./lesson-095.md) |

**균일 속도** — parameter t≠균일 s. [095](./lesson-095.md) `sampleMotionAlongPathUniform`.

## flatten tangent vs 해석적 법선

| | `pointAtPathLength` tangent | [070](./lesson-070.md) `cubicNormalAt` |
|---|------------------------------|----------------------------------------|
| 출처 | polyline edge | Bézier 미분 |
| 용도 | textPath, coarse motion | offset, curvature, 정밀 법선 |

textPath·화살표는 보통 flatten tangent로 충분. inside stroke offset은 [070](./lesson-070.md).

## native 비교 ([097](./lesson-097.md))

```js
pathEl.getPointAtLength(s);  // DOM, flatten 내부
// vs
pointAtPathLength(segments, s, opts);  // segment graph, 편집 중
```

## Core API

- `pointAtPathLength`, `pointAtPolylineLength`
- `pathLength`, `flattenPathSegments`
- `sampleMotionAlongPath`, `buildArcLengthLookup` — [094](./lesson-094.md), [095](./lesson-095.md)
- `cubicNormalAt` — [070](./lesson-070.md)

## 관련

- [017](./lesson-017.md) L · [016](./lesson-016.md) flatten 품질 · Part 23–24 motion

## 오늘의 핵심

motion·textPath = **path grammar + length sampling**. s→(point,tangent)까지 svg-matrix, **언제 s가 시간에 매핑되느냐**는 animation 레이어([094](./lesson-094.md), css-matrix).
