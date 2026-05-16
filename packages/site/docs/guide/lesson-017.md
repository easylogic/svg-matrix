---
id: "017"
title: "path length"
part: "Part 4. Path sampling"
demo: "path-length"
---

# path length

flatten한 polyline의 segment 길이를 합하면 **path length**가 됩니다. dasharray, **textPath `startOffset`**, **motion path `offset-distance`**가 모두 이 스칼라에 의존합니다.

<LessonDemo id="017" />

## API

```js
import { pathLength } from "svg-matrix-core";

const L = pathLength(segments, { stepsPerCurve: 24 });
```

step을 키우면 L이 수렴합니다. [016](./lesson-016.md)과 [052](./lesson-052.md) adaptive flatten을 쓰면 같은 tolerance에 더 적은 점으로 L을 맞출 수 있습니다.

## motion · text와의 연결

- [018 point at length](./lesson-018.md) — `L`의 역함수: 거리 → 점
- [063 textPath](./lesson-063.md) — `startOffset="50%"` = `0.5 * L`
- css-matrix **Motion path** — 균일 속도는 `t`가 아니라 `s`를 재매개화

SVG SMIL `<animateMotion>`도 path length 기반입니다 (브라우저 내부 flatten과 동일 계열).

## Core API

- `pathLength`, `polylineLength`
- `strokeDashIntervals` — dash phase ([051](./lesson-051.md))

## 오늘의 핵심

path length는 “geometry + sampling”의 결과 하나입니다. 068–069는 그 sampling을 adaptive로 줄이는 방법입니다.
