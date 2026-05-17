---
id: "063"
title: "text · textPath"
part: "Part 14. SVG spec breadth"
demo: "svg-text-path"
---

# text · textPath

`<textPath>`로 **path를 따라가는 라벨**을 만듭니다. Figma text는 보통 outline path로 export됩니다.

<LessonDemo id="063" />

## 데모에서 볼 것

```txt
pathD = M 60 300 Q 200 60 360 300 T 580 180
```

- 회색 **guide** path (dash)  
- toolbar **label** 입력 — 기본 `SVG Geometry`  
- readout: `<defs><path id="label-path">…</path></defs><text><textPath>…`  

```js
import { buildTextPathMarkup } from "svg-matrix-core";

buildTextPathMarkup({
  pathD,
  text: "SVG Geometry",
  pathId: "label-path"
});
```

## 구조

```xml
<defs>
  <path id="label-path" d="…"/>
</defs>
<text><textPath href="#label-path">…</textPath></text>
```

startOffset·spacing — SMIL/CSS는 별도; 위치 샘플은 [018](./lesson-018.md) `pointAtPathLength`.

## Core API

| 함수 | 역할 |
|------|------|
| `buildTextPathMarkup` | defs + textPath 문자열 |

## 관련

- [018](./lesson-018.md) · [070](./lesson-070.md) tangent

## 오늘의 핵심

text on path = **defs path id + textPath href**. 편집 가능 텍스트가 필요하면 DOM text, 인쇄용은 outline.
