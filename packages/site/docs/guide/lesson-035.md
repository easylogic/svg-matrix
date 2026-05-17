---
id: "035"
title: "filter chain 개요"
part: "Part 9. SVG filter & Figma effects"
demo: "filter-chain"
---

# filter chain 개요

SVG `<filter>`는 작은 **픽셀 DAG**(방향 비순환 그래프)입니다. `fe*` primitive가 `in` / `result` 이름으로 이어지고, 마지막에 `SourceGraphic`과 merge하는 패턴이 그림자의 정석입니다.

<LessonDemo id="035" />

## 최소 예 — blur + offset

```js
import { buildSvgFilter, buildFilterRegion, buildFilterPrimitive } from "svg-matrix-core";

const { filterAttr, markup } = buildSvgFilter({
  filterId: "chain-1",
  region: buildFilterRegion(50), // x="-50%" y="-50%" width="200%" height="200%"
  primitives: [
    buildFilterPrimitive("feGaussianBlur", {
      in: "SourceAlpha",
      stdDeviation: 5,
      result: "blur"
    }),
    buildFilterPrimitive("feOffset", {
      in: "blur",
      dx: 4,
      dy: 6,
      result: "off"
    })
  ]
});
```

## `in` 키워드 — 무엇을 샘플하나

| `in` | 내용 |
|------|------|
| `SourceGraphic` | 원본 RGBA (색 포함) |
| `SourceAlpha` | 알파 채널만 → **실루엣** |
| `BackgroundImage` | 뒤 배경 ([038](./lesson-038.md)) |
| `result` 이름 | 이전 primitive 출력 |

drop shadow는 **SourceAlpha**로 blur해야 “형태만” 그림자가 됩니다.

## `result` — 파이프 이름

```xml
<feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/>
<feOffset in="blur" dx="4" dy="6" result="off"/>
```

다음 단계는 `in="blur"`처럼 **이전 result**를 참조합니다.

## 데모 — drop shadow 전체 chain

`mountFilterChainDemo`는 `buildDropShadowFilterChain` 결과를 rect에 적용합니다. readout 파이프라인:

```txt
SourceAlpha → blur → offset → flood color → composite → merge with SourceGraphic
```

생성 markup 구조 ([036](./lesson-036.md)와 동일):

```xml
<filter id="chain-demo" ...>
  <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/>
  <feOffset in="blur" dx="0" dy="6" result="offsetBlur"/>
  <feFlood flood-color="rgb(0 0 0)" flood-opacity="0.25" result="color"/>
  <feComposite in="color" in2="offsetBlur" operator="in" result="shadow"/>
  <feMerge>
    <feMergeNode in="shadow"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

## filter region

```js
buildFilterRegion(expandPercent = 50);
// { x: "-50%", y: "-50%", width: "200%", height: "200%" }
```

blur·offset이 object bbox 밖으로 나가면 region이 작을 때 **그림자가 잘립니다**.

## 빌더 API

| 함수 | 역할 |
|------|------|
| `buildFilterPrimitive` | `fe*` 한 줄 XML |
| `buildSvgFilter` | `filter` 래퍼 + primitives 배열 |
| `buildFilterRegion` | % 기반 region |
| `buildDropShadowFilterChain` | Figma DROP_SHADOW 프리셋 |

문자열 primitive도 가능: `"<feMerge>…</feMerge>"` — merge는 자식 노드가 있어 문자열로 넣습니다.

## Core API

- `buildSvgFilter`, `buildFilterPrimitive`, `buildFilterRegion`
- `buildDropShadowFilterChain`

## 관련

- [031](./lesson-031.md) feDropShadow shortcut · [036](./lesson-036.md) 단계별 해설 · [037](./lesson-037.md) inner composite

## 오늘의 핵심

Figma effect = **이 primitive 목록의 프리셋**. [031](./lesson-031.md) 한 줄 API도 내부적으로 같은 수학입니다.
