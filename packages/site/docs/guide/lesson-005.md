---
id: "005"
title: "join, cap, miter limit"
part: "Part 2. Stroke geometry"
demo: "stroke-style"
---

# join, cap, miter limit

stroke는 path **중심선**을 따라 그리지만, **모서리(join)** 와 **열린 끝(cap)** 에서는 중심선만으로 모양이 정해지지 않습니다. SVG는 `stroke-linejoin`, `stroke-linecap`, `stroke-miterlimit`로 규칙을 고정합니다. [004](./lesson-004.md) stroke hit은 중심선 거리이고, 여기서는 **렌더 규칙**입니다.

<LessonDemo id="005" />

## 데모에서 볼 것

```txt
M 80 300 L 220 120 L 360 300
```

열린 polyline — `stroke-width: 18`.

| control | SVG 속성 |
|---------|----------|
| **join** | `stroke-linejoin`: miter / round / bevel |
| **cap** | `stroke-linecap`: butt / round / square |
| **miterlimit** | `stroke-miterlimit` (1–20, 기본 4) |

- **miter** + 낮은 limit + acute 꼭짓점 `(220, 120)` → 긴 spike 또는 bevel fallback  
- **round** join/cap → 반지름 `strokeWidth/2` 원호  
- **butt** cap → 끝점에서 수직으로 자름 (열린 path 양 끝)  

readout에 join/cap/limit 값이 표시됩니다. 수치 계산은 [013](./lesson-013.md) `miter-math` 데모.

## linejoin — 두 segment가 만나는 점

| 값 | 기하 |
|----|------|
| `miter` | 바깥 edge를 **연장**한 교점 = 꼭짓점 |
| `bevel` | spike 잘라 **직선** 연결 |
| `round` | **원호** (반지름 ≈ sw/2) |

acute angle일수록 miter 교점이 중심선에서 멀어집니다. `stroke-miterlimit × strokeWidth`를 넘으면 브라우저·SVG는 **bevel**로 그립니다.

```js
import { miterLength, shouldBevelJoin, segmentTurnAngle } from "svg-matrix-core";

const incoming = { x: 1, y: 0 };
const outgoing = { x: -0.5, y: 0.866 };
const turn = segmentTurnAngle(incoming, outgoing);

const strokeWidth = 18;
const miterLimit = 4;
const spike = miterLength(turn, strokeWidth);
const useBevel = shouldBevelJoin(turn, strokeWidth, miterLimit);
```

공식·내각↔turn 변환 — [013](./lesson-013.md).

## linecap — 열린 path의 끝

| 값 | 모양 | path 길이·hit |
|----|------|----------------|
| `butt` | 끝점에서 자름 | [017](./lesson-017.md) length = centerline |
| `round` | 끝에 **반원** | cap 밖 클릭은 stroke miss ([004](./lesson-004.md)) |
| `square` | tangent 방향으로 **sw/2** 연장 후 자름 | 시각적으로 path가 길어 보임 |

닫힌 path(`Z`)에서는 cap이 거의 보이지 않고 **join**이 지배합니다.

## SVG · Canvas · Figma

```xml
<path d="..." fill="none" stroke="currentColor"
  stroke-width="18"
  stroke-linejoin="round"
  stroke-linecap="round"
  stroke-miterlimit="4" />
```

```js
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.miterLimit = 4;
```

Figma `stroke.join` / `stroke.miterLimit` → SVG export ([figma-bridge](../../svg-matrix-core/src/figma-bridge.js): MITER / BEVEL / ROUND).

## 편집기 · hit

| 레이어 | 내용 |
|--------|------|
| geometry | centerline segments ([003](./lesson-003.md)) |
| stroke render | join/cap 규칙 (브라우저 또는 자체 mesh) |
| hit | [004](./lesson-004.md) `distance ≤ sw/2` — **join spike**는 별도 (miter가 bbox 밖으로 나갈 수 있음) |

굵은 stroke UI는 **helper band**를 넓혀 잡기 쉽게 하는 경우가 많습니다.

## 연결

| 강의 | 주제 |
|------|------|
| [013](./lesson-013.md) | miter length 수식 |
| [006](./lesson-006.md) | inside/outside stroke (SVG는 center만) |
| [051](./lesson-051.md) | dash phase (css-matrix) |
| [078](./lesson-078.md) | offset cusp (다른 “좁은 각”) |

## Core API

| 함수 | 역할 |
|------|------|
| `segmentTurnAngle` | incoming/outgoing → turn |
| `miterLength` | turn + sw → spike 길이 |
| `shouldBevelJoin` | limit 초과 여부 |

## 관련

- [004](./lesson-004.md) · [013](./lesson-013.md) · [006](./lesson-006.md)

## 오늘의 핵심

join/cap은 **같은 centerline에 다른 stroke renderer**입니다. preview·export·Figma bridge가 동일 속성·[013](./lesson-013.md) miter 규칙을 쓰면 브라우저와 맞습니다.
