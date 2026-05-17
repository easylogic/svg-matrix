---
id: "007"
title: "H, V — 축 정렬 직선"
part: "Part 1. Path grammar"
demo: "path-hv"
---

# H, V — 축 정렬 직선

`H`/`V`는 **한 축만** 움직이는 직선의 축약 문법입니다. `parsePathD`는 항상 `L`(line) segment로 **정규화**하므로, 편집기 내부 모델에는 H/V가 남지 않아도 됩니다.

<LessonDemo id="007" />

## 명령 정리

| 명령 | 의미 |
|------|------|
| `H x` | 현재 y 유지, x만 절대 좌표로 이동 |
| `V y` | 현재 x 유지, y만 절대 좌표로 이동 |
| `h dx` / `v dy` | 상대 이동 (한 축만) |

와이어프레임·다이어그램·픽셀 그리드 UI에서 `H`/`V`가 많이 나옵니다. 사람이 읽기 쉽고, 파서는 `L`로 통일하면 됩니다.

## 정규화 예

```txt
M 10 20 H 100 V 80
→ M(10,20) L(100,20) L(100,80)
```

```js
import { parsePathD, pathDFromSegments } from "svg-matrix-core";

const { segments } = parsePathD("M 10 20 H 100 V 80");
// segments: M, L, L — H/V 없음
```

## Core API

- `parsePathD`, `pathDFromSegments`, `pathFromD`

## 관련 강의

- [003 M, L, Z](./lesson-003.md)
- [008 C cubic](./lesson-008.md)

## 오늘의 핵심

문법 sugar는 export·손코딩용이고, **segment graph는 L/C/Q/A만** 있어도 충분합니다. 정규화를 한곳에서 하면 hit test·bbox·편집기가 단순해집니다.
