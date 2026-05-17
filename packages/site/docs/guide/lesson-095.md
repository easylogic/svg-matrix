---
id: "095"
title: "uniform speed along path"
part: "Part 24. Motion precision"
demo: "anim-uniform-motion"
---

# uniform speed along path

**segment parameter t**로 움직이면 곡선 구간에서 속도가 달라집니다. arc-length LUT로 **균일 속도**를 만듭니다.

<LessonDemo id="095" />

## 데모에서 볼 것

```txt
pathD = M 40 160 C 40 20, 600 20, 600 160
```

- **progress %** 슬라이더  
- **주황** dot — `sampleMotionAlongPathByParameter` (SMIL 느낌)  
- **파랑** dot — `sampleMotionAlongPathUniform` + lookup  
- readout: lookup `stepsPerCurve`, `total` length  

```js
import {
  buildArcLengthLookup,
  sampleMotionAlongPathByParameter,
  sampleMotionAlongPathUniform,
  parsePathD
} from "svg-matrix-core";

const segments = parsePathD(pathD);
const lookup = buildArcLengthLookup(segments, { stepsPerCurve: 48 });
const byParam = sampleMotionAlongPathByParameter(segments, 0.5);
const uniform = sampleMotionAlongPathUniform(segments, 0.5, { lookup });
```

## 비교

| API | progress 의미 |
|-----|----------------|
| `sampleMotionAlongPathByParameter` | segment index 비율 |
| `sampleMotionAlongPathUniform` | arc length 비율 (LUT) |
| `sampleMotionAlongPath` | [094](./lesson-094.md) flatten length |

## Core API

| 함수 | 역할 |
|------|------|
| `buildArcLengthLookup` | length table |
| `sampleMotionAlongPathUniform` | 균일 s |
| `sampleMotionAlongPathByParameter` | parameter t |

## 관련

- [094](./lesson-094.md) · [090](./lesson-090.md) SMIL

## 오늘의 핵심

“같은 5초”라도 **parameter**와 **arc length**는 다른 궤적 — 아이콘·모션 디자인은 uniform이 자연스럽습니다.
