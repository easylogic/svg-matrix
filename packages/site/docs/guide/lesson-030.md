---
id: "030"
title: "scanline parity"
part: "Part 7. Fill & winding deep dive"
demo: "scanline"
---

# scanline parity

CPU **fill rasterizer**는 y를 고정한 **scanline** 위에서 x를 훑으며, edge crossing마다 inside 플래그를 **토글**합니다. [025](./lesson-025.md) ray casting의 **한 줄 버전**을 눈으로 보는 강의입니다.

<LessonDemo id="030" />

## 데모에서 볼 것

compound rect + hole ([026](./lesson-026.md)와 같은 `d`):

```txt
M 10 20 L 90 20 L 90 80 L 10 80 Z
M 30 35 L 70 35 L 70 65 L 30 65 Z
```

| UI | 동작 |
|----|------|
| **scan Y** 슬라이더 | 빨간 수평선 y |
| path | 연한 fill + stroke |
| readout | `inside spans (sampled): …` — x=0..100 step 2에서 `evenodd` inside인 x 목록 |

```txt
scanline y=50 (evenodd)
inside spans (sampled): 12,14,16,…
rasterizer: parity flips at each edge crossing
```

슬라이더로 y를 옮기면 **ring 안/밖** 구간이 바뀝니다.

## evenodd = parity flip

```js
import { classifyPointInPath, parsePathD } from "svg-matrix-core";

const segments = parsePathD(d);
let inside = false;
for (let x = 0; x <= width; x++) {
  const c = classifyPointInPath({ x, y }, segments, "evenodd");
  // 데모: c.inside일 때 x를 span에 기록
}
```

실제 rasterizer는 edge **정렬(active edge table)** 후 crossing x에서만 토글 — 데모는 `classifyPointInPath`로 **동일 규칙** 검증.

```js
import { evenoddParityFromRayCast } from "svg-matrix-core";
evenoddParityFromRayCast({ x, y }, polygon);
```

[084](./lesson-084.md) 픽셀 parity와 동일.

## nonzero scanline

evenodd 대신 **winding 누적** scanline도 가능합니다. SVG `fill-rule="nonzero"`는 winding ≠ 0 영역을 채웁니다. 이 코스 데모는 **evenodd**로 span을 읽기 쉽게 표시합니다.

## vs `classifyPointInPath`

| | point query | scanline |
|---|-------------|----------|
| 질문 | (x,y) 하나 inside? | 고정 y에서 inside x 구간 |
| core | `classifyPointInPath` | 동일 + x 루프 |
| 용도 | hit test | fill raster preview |

[027](./lesson-027.md) self-intersect — y를 고정해도 중앙 lobe에서 span이 끊깁니다.

## vs GPU / mesh

| | scanline | triangulation |
|---|----------|----------------|
| 엔진 | CPU parity | [083](./lesson-083.md), [100](./lesson-100.md) GPU |
| evenodd | 자연스러움 | stencil / evenodd pass |
| PDF·preview | 흔함 | WebGL 실시간 |

## Core API

| 함수 | 역할 |
|------|------|
| `classifyPointInPath` | `crossings`, `insideEvenOdd` |
| `evenoddParityFromRayCast` | polygon 한 점 |
| `parsePathD`, `segmentsToSubpaths` | compound |

## 관련

- [025](./lesson-025.md) · [026](./lesson-026.md) · [027](./lesson-027.md) · [084](./lesson-084.md) · [102](./lesson-102.md)

## 오늘의 핵심

scanline은 `classifyPointInPath` evenodd의 **시각화**입니다. 알고리즘 이해·디버그용이고, 최종 WebGL fill은 mesh·stencil 경로가 많습니다.
