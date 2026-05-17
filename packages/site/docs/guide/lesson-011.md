---
id: "011"
title: "A — elliptical arc"
part: "Part 1. Path grammar"
demo: "path-arc"
---

# A — elliptical arc

`A` 명령은 **타원 호 하나**를 정의합니다. 파라미터는 `rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y` 입니다. 같은 끝점 사이에는 보통 **호가 두 개** 있고, flag로 하나를 고릅니다.

<LessonDemo id="011" />

## flag 직관

| flag | 의미 |
|------|------|
| large-arc | 180°보다 큰 호 vs 작은 호 |
| sweep | 진행 방향 (시계/반시계) |

엔진·편집기는 내부적으로 `A`를 **cubic Bézier chain**으로 바꿔 다루는 경우가 많습니다.

```js
import { convertArcsInPathD, arcSegmentToCubics, svgArcCenterParameters } from "svg-matrix-core";

const { d, arcCount } = convertArcsInPathD("M 0 50 A 50 50 0 0 1 100 50");
// d에 C segment만 남음
```

## flatten vs exact

| 목적 | 방법 |
|------|------|
| 화면·hit test | `flattenPathSegments` (적응형 step) |
| 정확 원 | `circle` 요소 또는 `A` 유지 |
| Figma import | `arcSegmentToCubics` |

원을 cubic만으로 근사하면 **4분원 × κ** 상수가 나옵니다 ([081 circle cubic](./lesson-081.md)).

## Core API

- `convertArcsInPathD`, `arcSegmentToCubics`
- `svgArcCenterParameters` — 중심·각도 디버그

## 관련 강의

- [016 arc flatten](./lesson-016.md)
- [082 rational vs arc](./lesson-082.md)

## 오늘의 핵심

`A`는 스펙상 정확한 타원 호입니다. 편집기 코어가 cubic-only라면 **import 시 한 번 변환**하고, export 시 다시 `A`로 줄이는 전략을 택하세요.
