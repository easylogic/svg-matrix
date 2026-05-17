---
id: "026"
title: "compound path — 여러 subpath"
part: "Part 7. Fill & winding deep dive"
demo: "compound-path"
---

# compound path — 여러 subpath

`d` 안에 `M`이 **두 번 이상** 나오면 **compound path**입니다. donut·문자 O·rect 구멍은 outer subpath + inner subpath로 표현합니다. [027](./lesson-027.md) self-intersect와 달리 **subpath가 분리**되어 있습니다.

<LessonDemo id="026" />

## 데모에서 볼 것

```txt
M 0 0 L 80 0 L 80 80 L 0 80 Z
M 20 20 L 60 20 L 60 60 L 20 60 Z
```

- toolbar **fill-rule**: `nonzero` / `evenodd`  
- readout — 구멍 중심 `(40, 40)`:

```txt
2 subpaths (outer + inner)
winding=… crossings=…
nonzero inside=…  evenodd inside=…
```

| rule | hole `(40,40)` (기본 winding) |
|------|------------------------------|
| `nonzero` | inner가 outer와 **반대** 방향이면 `insideNonZero: true` (채워짐) — **구멍이 안 뚫림** |
| `evenodd` | `insideEvenOdd: false` — **구멍** |

“구멍을 만들려면 inner subpath winding을 반대로” — readout 안내와 동일.

## `segmentsToSubpaths`

```js
import { parsePathD, segmentsToSubpaths } from "svg-matrix-core";

const d =
  "M 0 0 L 80 0 L 80 80 L 0 80 Z M 20 20 L 60 20 L 60 60 L 20 60 Z";
const segments = parsePathD(d);
const subpaths = segmentsToSubpaths(segments);
// length === 2
// subpaths[0]: outer M…Z
// subpaths[1]: inner M…Z
```

[003](./lesson-003.md) `Z` → 닫는 `L`. 각 subpath는 독립 polygon으로 flatten됩니다.

## fill-rule 적용 순서

```js
import { classifyPointInPath } from "svg-matrix-core";

const c = classifyPointInPath({ x: 40, y: 40 }, segments, "evenodd");
// subpath마다 winding/crossing → 합산 → rule 한 번
```

```txt
classifyPointInPath:
  segmentsToSubpaths
  → 각 subpath flattenPathSegments
  → winding += … , crossings += …
  → nonzero | evenodd
```

[014](./lesson-014.md) 단일 rect+hole 데모와 동일 기하, viewBox `0 0 100 100`.

## hole winding 관례

| 목표 | nonzero | evenodd |
|------|---------|---------|
| 구멍 | inner **CW** if outer **CCW** (또는 반대로 쌍으로) | subpath **홀수/짝수** 겹침 |
| solid | 같은 방향 유지 | outer만 있어도 inside |

```js
import { signedPolygonArea } from "svg-matrix-core";

const poly = flattenPathSegments(subpaths[0], { stepsPerCurve: 4 });
signedPolygonArea(poly); // 부호로 CCW/CW ([073](./lesson-073.md))
```

## vs 다른 Part 7 강의

| 강의 | 주제 |
|------|------|
| [014](./lesson-014.md) | fill-rule 입문 (큰 viewBox 데모) |
| **026 (여기)** | compound = 여러 `M` |
| [027](./lesson-027.md) | **한** subpath가 스스로 교차 |
| [028](./lesson-028.md) | 두 path set boolean |
| [100](./lesson-100.md) | outer + hole mesh |

## 편집기 · Figma

- [054](./lesson-054.md) `listSubpathHandles` — subpath별 handle  
- Figma boolean SUBTRACT → often **evenodd** compound ([042](./lesson-042.md))  
- export 전 inner winding 점검 — nonzero에서 실수 많음  

## Core API

| 함수 | 역할 |
|------|------|
| `segmentsToSubpaths` | `M` 기준 분리 |
| `classifyPointInPath`, `pointInPath` | compound + fill-rule |
| `signedPolygonArea` | winding 방향 |
| `listSubpathHandles`, `updateSubpathHandle` | compound 편집 |

## 관련

- [003](./lesson-003.md) · [014](./lesson-014.md) · [027](./lesson-027.md) · [028](./lesson-028.md) · [100](./lesson-100.md)

## 오늘의 핵심

compound = **subpath 배열 + fill-rule 한 번**. nonzero 구멍은 **inner winding 반대**, evenodd는 **겹침 parity**. [028](./lesson-028.md) boolean 전에 subpath 방향을 맞추세요.
