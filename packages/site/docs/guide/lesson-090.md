---
id: "090"
title: "SMIL — animateMotion"
part: "Part 23. SVG animation"
demo: "anim-smil-motion"
---

# SMIL — animateMotion

`<animateMotion>` + `<mpath>`로 **path를 따라** 객체를 이동합니다.

<LessonDemo id="090" />

## 데모에서 볼 것

```txt
pathD = M 60 150 C 160 20, 480 280, 580 80
```

- 회색 **motion path** (dash)  
- 파란 **circle** — `rotate="auto"`  
- readout: `buildAnimateMotionMarkup` XML  

```js
import { buildAnimateMotionMarkup } from "svg-matrix-core";

buildAnimateMotionMarkup({
  pathId: "motion-path",
  dur: "5s",
  rotate: "auto"
});
```

## arc length

SMIL은 브라우저가 path length를 샘플링 — 개념은 [017](./lesson-017.md)–[018](./lesson-018.md). 균일 속도는 [095](./lesson-095.md).

## Core API

| 함수 | 역할 |
|------|------|
| `buildAnimateMotionMarkup` | motion + mpath |

## 관련

- [017](./lesson-017.md) · [092](./lesson-092.md) CSS offset-path

## 오늘의 핵심

animateMotion = **path id 참조** — 편집기에서 path가 바뀌면 mpath도 같이 갱신해야 합니다.
