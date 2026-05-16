---
id: "063"
title: "text · textPath"
part: "Part 14. SVG spec breadth"
demo: "svg-text-path"
---

# text · textPath

SVG에서 글자를 **path를 따라 배치**할 때 `<textPath>`를 씁니다. Figma는 보통 텍스트를 outline path로 export합니다.

<LessonDemo id="063" />

## 마크업

```js
import { buildTextPathMarkup } from "svg-matrix-core";

buildTextPathMarkup({
  pathId: "label-path",
  pathD: "M 40 200 C 120 80 520 320 600 120",
  text: "SVG Geometry"
});
```

`defs` 안에 guide path, `<text><textPath href="#…" startOffset="…">` 구조입니다.

## 수학 연결

| 주제 | 강의 |
|------|------|
| path 위 거리 | [017 path length](./lesson-017.md) |
| 접선·법선 (글자 기울기) | [018 point at length](./lesson-018.md), [070 κ·법선](./lesson-070.md) |
| 균일 속도 배치 | css-matrix **Motion path** 부록 (arc length 재매개화) |

`startOffset`은 path **길이** 기준(%)입니다. `t`를 균등히 쓰면 글자 간격이 휘어진 구간에서 벌어집니다.

## motion path와의 차이

- **textPath** — 문자 glyph 배치 (이 강의)
- **motion path** — 객체 중심이 path를 따라 이동 (SVG `<animateMotion>` / CSS `offset-path`; 수학은 [017–018](./lesson-017.md) + css-matrix)

svg-matrix에는 textPath **마크업·샘플링 링크**까지, motion **엔진·CSS 연결**은 css-matrix 부록 B가 더 깊습니다.

## Core API

- `buildTextPathMarkup`

## 오늘의 핵심

textPath는 “문자열 + path geometry”입니다. 위치는 `pointAtPathLength`, 방향은 tangent/normal(070)과 같은 sampling 계열입니다.
