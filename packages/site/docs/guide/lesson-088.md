---
id: "088"
title: "SMIL — animate 속성"
part: "Part 23. SVG animation"
demo: "anim-smil-attribute"
---

# SMIL — animate 속성

`<animate>`로 `opacity`, `fill`, `cx` 등 **스칼라 속성**을 `from`→`to`로 보간합니다.

<LessonDemo id="088" />

## 데모에서 볼 것

- 파란 rect — `opacity` 0.2↔1 **2s** 반복 SMIL  
- readout: 생성된 `<animate …>` XML 한 줄  

```js
import { buildAnimateMarkup } from "svg-matrix-core";

buildAnimateMarkup({
  attributeName: "opacity",
  from: 0.2,
  to: 1,
  dur: "2s",
  repeatCount: "indefinite"
});
```

rect에 `innerHTML`로 `<animate>` 자식 삽입 — 데모와 동일.

## SMIL vs CSS vs WAAPI

| | 선언 | 비고 |
|---|------|------|
| SMIL | SVG 자식 | 일부 브라우저 deprecated 추세 |
| CSS | stylesheet | css-matrix easing |
| WAAPI | JS | [101](./lesson-101.md) |

오프라인·편집기 preview는 [094](./lesson-094.md) JS sampling.

## Core API

| 함수 | 역할 |
|------|------|
| `buildAnimateMarkup` | `<animate>` 문자열 |

## 관련

- [089](./lesson-089.md) · [101](./lesson-101.md)

## 오늘의 핵심

SMIL = **선언형 XML 빌더** — geometry는 svg-matrix, easing 곡선은 css-matrix가 더 깊습니다.
