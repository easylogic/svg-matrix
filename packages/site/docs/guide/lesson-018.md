---
id: "018"
title: "point at length와 tangent"
part: "Part 4. Path sampling"
demo: "path-point"
---

# point at length와 tangent

path 위 **거리 s**에서의 점과 접선 방향입니다. 화살표 머리, **textPath** 글자 방향, **motion path** 위치에 모두 같은 sampling이 들어갑니다.

<LessonDemo id="018" />

## API

```js
import { pointAtPathLength, pathLength } from "svg-matrix-core";

const total = pathLength(segments, { stepsPerCurve: 24 });
const sample = pointAtPathLength(segments, total * 0.35, { stepsPerCurve: 24 });
// sample.point, sample.tangent (flatten segment 방향)
```

flatten이 coarse하면 점·접선이 흔들립니다. [016](./lesson-016.md)·[052](./lesson-052.md)와 같이 보면 정확도 trade-off가 보입니다.

## textPath · motion path

| 용도 | SVG / CSS | 수학 |
|------|-----------|------|
| 글자沿 path | `<textPath startOffset>` — [063](./lesson-063.md) | s → point, tangent → rotate glyph |
| 객체沿 path | `<animateMotion>`, CSS `offset-path` | 동일 + **균일 속도**는 s 비선형 → css-matrix Motion path |

svg-matrix는 **s → (point, tangent)** 까지. CSS/SMIL 선언과 keyframe 엔진은 [css-matrix Motion path](https://github.com/easylogic/css-graphics-geometry) 부록 B가 더 깊습니다.

## 법선

정확한 법선·곡률은 flatten tangent가 아니라 [070](./lesson-070.md) `cubicNormalAt`입니다. textPath는 보통 tangent만으로도 충분한 경우가 많습니다.

## Core API

- `pathLength`, `pointAtPathLength`
- `cubicNormalAt`, `cubicCurvatureAt` — [070](./lesson-070.md)

## 오늘의 핵심

motion path와 textPath는 “path grammar + length sampling”의 응용입니다. 균일 속도만 별도 강의( css-matrix 050 )에서 다룹니다.
