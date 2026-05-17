---
id: "091"
title: "stroke dash draw-on"
part: "Part 23. SVG animation"
demo: "anim-dash-draw"
---

# stroke dash draw-on

`pathLength` + `stroke-dasharray` + CSS `@keyframes` `stroke-dashoffset`으로 **선 그리기** 효과.

<LessonDemo id="091" />

## 데모에서 볼 것

```txt
pathD = M 80 120 C 200 20, 440 220, 560 80
```

- `<style>` — `@keyframes` from kit  
- path: `pathLength`, `stroke-dasharray` = length, `style` animation  
- readout: `pathLength=…`, keyframes, style  

```js
import { strokeDashDrawKeyframes, pathLength, parsePathD } from "svg-matrix-core";

const segments = parsePathD(pathD);
const len = Math.round(pathLength(segments, { stepsPerCurve: 24 }));
const kit = strokeDashDrawKeyframes(len, { duration: "3s" });
// kit.pathLength, kit.keyframes, kit.style, kit.pathAttrs
```

## vs [051](./lesson-051.md)

| | 051 | 091 |
|---|-----|-----|
| 초점 | dash phase·offset path 엔진 | **draw-on CSS kit** |
| UI | 슬라이더 scrub | CSS animation |

## Core API

| 함수 | 역할 |
|------|------|
| `strokeDashDrawKeyframes` | pathLength + keyframes + style |
| `pathLength` | flatten 기반 길이 |

## 관련

- [051](./lesson-051.md) · [017](./lesson-017.md)

## 오늘의 핵심

draw-on = **dasharray = pathLength**, offset 0→length. length를 먼저 맞춥니다.
