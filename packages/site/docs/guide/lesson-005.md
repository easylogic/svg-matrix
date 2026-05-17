---
id: "005"
title: "join, cap, miter limit"
part: "Part 2. Stroke geometry"
demo: "stroke-style"
---

# join, cap, miter limit

stroke는 path **중심선**을 따라 그리지만, **모서리(join)** 와 **끝(cap)** 에서는 중심선만으로는 모양이 정해지지 않습니다. SVG는 `stroke-linejoin`, `stroke-linecap`, `stroke-miterlimit`로 규칙을 고정합니다.

<LessonDemo id="005" />

## linejoin — 두 segment가 만나는 점

| 값 | 기하 |
|----|------|
| `miter` | 두 tangent 방향을 **연장**한 직선의 교점을 꼭짓점으로 사용 |
| `bevel` | 교점 대신 **직선으로 잘라** 연결 |
| `round` | 교점 대신 **원호**로 연결 |

acute angle일수록 miter 교점은 중심선에서 멀어집니다. 그 길이가 `stroke-miterlimit × strokeWidth`를 넘으면 구현은 **bevel로 fallback**합니다.

```js
import { miterLength, shouldBevelJoin, segmentTurnAngle } from "svg-matrix-core";

const angle = segmentTurnAngle(incoming, outgoing);
const miter = miterLength(angle, strokeWidth);
const bevel = shouldBevelJoin(angle, strokeWidth, miterLimit);
```

## linecap — 열린 path의 끝

| 값 | 모양 |
|----|------|
| `butt` | 끝점에서 그대로 자름 |
| `round` | 끝점에 **반원** (반지름 = strokeWidth/2) |
| `square` | 끝점에서 tangent 방향으로 strokeWidth/2 연장 후 자름 |

## Core API

- `miterLength`, `shouldBevelJoin`, `segmentTurnAngle` — `svg-matrix-core`

## 관련 강의

- [004 stroke hit](./lesson-004.md)
- [006 stroke align](./lesson-006.md)
- [051 stroke-dasharray](./lesson-051.md) (css-matrix)

## 오늘의 핵심

join/cap을 바꾸는 것은 **같은 centerline에 다른 stroke renderer**를 쓰는 것입니다. 편집기 preview도 centerline + join 규칙을 재현해야 Figma export와 맞습니다.
