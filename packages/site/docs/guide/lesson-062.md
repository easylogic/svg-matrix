---
id: "062"
title: "markers — 화살표와 dash 끝"
part: "Part 14. SVG spec breadth"
demo: "svg-markers"
---

# markers — 화살표와 dash 끝

`marker-start` / `marker-mid` / `marker-end`로 선 끝·꺾임에 **심볼**을 붙입니다.

<LessonDemo id="062" />

## 데모에서 볼 것

```txt
path d = M 80 300 C 200 80, 440 360, 560 120
```

- defs **arrow** marker  
- `marker-end="url(#arrow)"`  
- readout: `<marker id="arrow">…` markup  

```js
import { buildMarkerMarkup } from "svg-matrix-core";

buildMarkerMarkup({ id: "arrow" });
// <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" orient="auto" …>
```

## orient=auto

접선 방향으로 marker 회전 — [070](./lesson-070.md) tangent·[018](./lesson-018.md) path length와 연결.

## Core API

| 함수 | 역할 |
|------|------|
| `buildMarkerMarkup` | `<marker>` defs 문자열 |

## 관련

- [051](./lesson-051.md) dash · [004](./lesson-004.md) stroke

## 오늘의 핵심

marker = **작은 SVG 심볼을 path 끝에 참조** — 화살표·dash cap 장식의 표준 방법입니다.
