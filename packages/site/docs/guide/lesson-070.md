---
id: "070"
title: "곡률 κ와 법선"
part: "Part 15. Curve calculus"
demo: "geom-curvature"
---

# 곡률 κ와 법선

cubic Bézier 위 한 점의 **접선·법선·곡률 κ** — offset·textPath·variable stroke에 쓰입니다.

<LessonDemo id="070" />

## 데모에서 볼 것

```txt
C 60,300  140,40  500,380  580,100
```

- **t** 슬라이더 0–100%  
- 주황 **점** — `cubicBezierPoint`  
- 초록 **법선 화살표** — `cubicNormalAt` × 60  
- readout: `κ=…`, `normal=(nx, ny)`  

## API

```js
import {
  cubicBezierPoint,
  cubicBezierTangent,
  cubicNormalAt,
  cubicCurvatureAt
} from "svg-matrix-core";

const t = 0.5;
const pt = cubicBezierPoint(p0, p1, p2, p3, t);
const n = cubicNormalAt(p0, p1, p2, p3, t, 1);
const kappa = cubicCurvatureAt(p0, p1, p2, p3, t);
```

```txt
κ = (x′y″ − y′x″) / |B′|³
```

## vs flatten tangent

| | [018](./lesson-018.md) polyline | 070 분석 |
|---|--------------------------------|----------|
| 속도 | 빠름 | segment마다 정확 |
| 용도 | hit·motion 근사 | offset·textPath·κ |

## 연결

| 용도 | 강의 |
|------|------|
| parallel offset | [077](./lesson-077.md) |
| offset cusp | [078](./lesson-078.md) — \|κ\| 큰 곳 |
| text on path | [063](./lesson-063.md) |

## Core API

| 함수 | 역할 |
|------|------|
| `cubicCurvatureAt` | 스칼라 κ |
| `cubicNormalAt` | 단위 법선 |
| `cubicBezierTangent` | B′ (정규화) |

## 오늘의 핵심

flatten tangent는 **근사**, `B′`/`B″`는 **분석적** — 정밀 offset·textPath는 후자가 안전합니다.
