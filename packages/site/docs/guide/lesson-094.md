---
id: "094"
title: "JS motion along path"
part: "Part 23. SVG animation"
demo: "anim-js-motion"
---

# JS motion along path

브라우저 SMIL/CSS 대신 **rAF 루프**에서 위치를 계산합니다. 편집기 preview·게임·export 시뮬레이션에 씁니다.

<LessonDemo id="094" />

## 데모에서 볼 것

```txt
pathD = M 60 150 C 160 30, 480 270, 580 70
```

- **progress %** 슬라이더  
- 파란 dot — `sampleMotionAlongPath` 위치  
- readout: `progress`, `totalLength`, `distance`, `tangent`  

```js
import { sampleMotionAlongPath, parsePathD, pathLength } from "svg-matrix-core";

const segments = parsePathD(pathD);
const total = pathLength(segments, { stepsPerCurve: 32 });

function frame(progress) {
  const { point, tangent, distance } = sampleMotionAlongPath(segments, progress, {
    stepsPerCurve: 32
  });
  dot.x = point.x;
  dot.y = point.y;
  // rotate = atan2(tangent.y, tangent.x)
}
```

`progress ∈ [0,1]` — **누적 arc length 비율** (polyline 근사).

## parameter speed vs uniform

| API | progress 의미 |
|-----|----------------|
| `sampleMotionAlongPath` | arc length (flatten 기반) |
| `sampleMotionAlongPathByParameter` | segment parameter t ([095](./lesson-095.md)) |
| `sampleMotionAlongPathUniform` | LUT로 균일 속도 ([095](./lesson-095.md)) |

## Canvas

```js
// 매 프레임
const { point, tangent } = sampleMotionAlongPath(segments, t, { stepsPerCurve: 48 });
ctx.setTransform(1,0,0,1, point.x, point.y);
ctx.rotate(Math.atan2(tangent.y, tangent.x));
ctx.drawImage(sprite, -w/2, -h/2, w, h);
```

## Core API

- `sampleMotionAlongPath`, `pathLength`, `pointAtPathLength`
- `buildArcLengthLookup`, `sampleMotionAlongPathUniform` — [095](./lesson-095.md)

## 오늘의 핵심

JS motion = **geometry sampling 엔진**. SMIL은 선언, 094는 실행 루프입니다.
