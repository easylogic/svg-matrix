---
id: "078"
title: "offset cusps"
part: "Part 17. Offset curves"
demo: "geom-offset-cusp"
---

# offset cusps

**acute corner**에서 parallel offset은 **cusp**(self-intersection)를 만듭니다. miter limit·variable width와 같은 기하입니다.

<LessonDemo id="078" />

## 데모에서 볼 것

5점 polyline (뾰족한 꺾임 포함):

```txt
(100,200) → (200,80) → (320,320) → (440,120) → (540,280)
```

- **회색** — 원본 `polyline`  
- **파란** — `offsetPolyline(points, 28, false)` — 코너 **루프·교차**  
- readout: `acute corner → offset polyline self-intersects (cusp)`  

## API

```js
import { offsetPolyline } from "svg-matrix-core";

const off = offsetPolyline(points, 28, false);
// closed=false — open polyline
```

path `d` 전체는 [051](./lesson-051.md) `offsetPathD` — flatten + 법선.

## 왜 생기나

```txt
        offset B
              \
               \  ← cusp
    --------V--------  centerline
                /
        offset A
```

[013](./lesson-013.md) miter — 좁은 각일수록 교점이 멀어지다 `miterlimit` → bevel.

## 완화

| 방법 | 강의 |
|------|------|
| bevel / round join | [005](./lesson-005.md), [013](./lesson-013.md) |
| subdivide 후 offset | [077](./lesson-077.md) |
| offset 후 clean | [028](./lesson-028.md) |
| inside stroke + clip | [006](./lesson-006.md), [060](./lesson-060.md) |

## Core API

| 함수 | 역할 |
|------|------|
| `offsetPolyline` | polyline parallel offset |
| `offsetPathD` | `d` + distance |

## 관련

- [077](./lesson-077.md) · [070](./lesson-070.md) · [051](./lesson-051.md)

## 오늘의 핵심

offset ≠ 항상 smooth parallel curve — **cusp 정책**(bevel / round / simplify)을 스펙에 넣으세요.
