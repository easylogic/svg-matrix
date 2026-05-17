---
id: "092"
title: "CSS offset-path motion"
part: "Part 23. SVG animation"
demo: "anim-css-motion"
---

# CSS offset-path motion

`offset-path` / `offset-distance`로 HTML 요소를 SVG path 위로 이동 — SMIL **대안**.

<LessonDemo id="092" />

## 데모에서 볼 것

```txt
pathD = M 40 100 Q 200 20 360 100 T 600 100
```

- div **●** — `offset-path`, `offset-distance` 애니  
- `@keyframes move-path { to { offset-distance: 100%; } }`  
- readout: `offset-path`, `animation` 문자열  

```js
import { buildOffsetPathMotionCss } from "svg-matrix-core";

buildOffsetPathMotionCss(pathD, {
  distance: "0%",
  keyframes: "move-path",
  duration: "4s"
});
// { offsetPath, distance, offsetRotate, animation }
```

## 브라우저

Chrome / Safari / Firefox modern — path 문자열은 `path("M …")` 형태.

## Core API

| 함수 | 역할 |
|------|------|
| `buildOffsetPathMotionCss` | offset-path CSS bundle |

## 관련

- [090](./lesson-090.md) SMIL · css-matrix motion

## 오늘의 핵심

CSS motion = **DOM 레이어** — SVG 내부 SMIL 없이 overlay UI를 path에 태울 때 유용합니다.
