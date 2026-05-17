---
id: "045"
title: "fill vs stroke icons"
part: "Part 11. Icon design"
demo: "icon-fill-stroke"
---

# fill vs stroke icons

같은 실루엣도 **filled** vs **stroked** 스타일에 따라 path·점 개수·export가 달라집니다.

<LessonDemo id="045" />

## 데모에서 볼 것

동일 `DEMO_ICON_D` ([044](./lesson-044.md)) — `snapPathDToIconGrid` 적용.

| style | 화면 |
|-------|------|
| **fill** | 왼쪽 — `fill` solid, closed path |
| **stroke** | 오른쪽 — `fill="none"`, centerline + `stroke-width` |

toolbar **style** 토글 — 비활성 쪽 `opacity=0.35`.

readout: `fill=solid` vs `stroke=centerline`, 공통 `d=…`.

## fill icon

```txt
closed path
fill="currentColor"   ([048](./lesson-048.md))
stroke 없음 (또는 0)
```

- [015](./lesson-015.md) fill hit — 영역 inside  
- compound 구멍 — evenodd ([026](./lesson-026.md))

## stroke icon

```txt
centerline path (종종 open 또는 closed)
fill="none"
stroke="currentColor"
stroke-width="1.5"   // crisp ([044](./lesson-044.md))
stroke-linejoin="round"
```

- [004](./lesson-004.md) stroke hit — 중심선 거리  
- [005](./lesson-005.md) join/cap  

## Figma strokeAlign

INSIDE/OUTSIDE ≠ SVG center → [041](./lesson-041.md) / [006](./lesson-006.md).

| 스타일 | Figma | SVG export |
|--------|-------|------------|
| filled | fill only | `<path fill>` |
| outline | center stroke | stroke attrs |

## Core API

데모: `snapPathDToIconGrid`, `nearestCrispStrokeWidth`. export: `figmaStrokeToSvgAttributes`, `currentColorAttributes`.

## 관련

- [044](./lesson-044.md) · [004](./lesson-004.md) · [046](./lesson-046.md)

## 오늘의 핵심

스타일을 **먼저** 정하면 point 수·곡률·hit 모델이 달라집니다. 한 아이콘 세트 안에서 패턴을 통일하세요.
