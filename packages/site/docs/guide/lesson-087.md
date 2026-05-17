---
id: "087"
title: "SVG 수학 주제 지도"
part: "Part 22. Math topic map"
demo: "geom-math-map"
---

# SVG 수학 주제 지도

Parts **15–22**(강의 **068–087**)는 path grammar(Part 1–6) 다음 단계의 **순수 기하·픽셀 수학**입니다. 이 강의는 그 목차를 한곳에 모은 **인덱스**이고, 데모는 `SVG_MATH_TOPIC_MAP` 전체를 출력합니다.

<LessonDemo id="087" />

## Part별 로드맵

| Part | 강의 | 다루는 질문 |
|------|------|-------------|
| **15** Curve calculus | 068–073 | 곡선을 어떻게 쪼개고, 얼마나 휘며, 면적은? |
| **16** Intersection | 074–076 | 선·곡선이 어디서 만나고, 가장 가까운 점은? |
| **17** Offset | 077–078 | parallel curve, cusp, stroke 안쪽 |
| **18** Transform | 079–080 | 역행렬, bake vs group |
| **19** Rational | 081–082 | 원·arc의 정확 표현 |
| **20** Tessellation | 083–084 | 삼각형 mesh, evenodd 픽셀 |
| **21** Compositing | 085–086 | blur kernel, Porter–Duff |
| **22** Map | 087 | (여기) 전체 색인 |

## 주제 → 강의 (core와 동기화)

`svg-matrix-core`의 `SVG_MATH_TOPIC_MAP`과 동일합니다.

| lesson | topic | Part |
|--------|-------|------|
| 068 | de Casteljau subdivision | 15 |
| 069 | flatness / chord error | 15 |
| 070 | curvature κ & normal | 15 |
| 071 | arc center parameters | 15 |
| 072 | G¹ smooth S/T | 15 |
| 073 | shoelace area | 15 |
| 074 | segment intersection | 16 |
| 075 | line ∩ cubic | 16 |
| 076 | closest point on curve | 16 |
| 077 | offset normals | 17 |
| 078 | offset cusps | 17 |
| 079 | affine inverse / decompose | 18 |
| 080 | transform path vs group | 18 |
| 081 | circle cubic κ | 19 |
| 082 | rational / exact arcs | 19 |
| 083 | convex triangulation | 20 |
| 084 | evenodd parity pixels | 20 |
| 085 | Gaussian blur kernel | 21 |
| 086 | Porter–Duff alpha | 21 |
| 087 | math topic map | 22 |

```js
import { SVG_MATH_TOPIC_MAP } from "svg-matrix-core";

SVG_MATH_TOPIC_MAP.forEach(({ lesson, topic, part }) => {
  console.log(lesson, topic, part);
});
```

## “막혔을 때” 빠른 길찾기

```txt
화면에 그리기/근사가 느리다        → 068–069, 052(adaptive flatten)
곡선이 튀어 보인다 / 법선 틀림     → 070, 018 vs cubicNormalAt
arc 편집·export                   → 071, 053, 082
핸들이 매끈하지 않다               → 072
면적·무게중심                     → 073
스냅·교차점                       → 074–076, 096
stroke 안쪽 / offset               → 077–078, 006
클릭이 어긋난다                    → 056, 079–080 (좌표계)
원이 각져 보인다                   → 081–082
GPU로 fill                        → 083–084, 100–102
그림자·blur 수식                  → 085, 031–039
합성·투명도                       → 086
```

## 시리즈 분담 (svg / css / webgl)

| 계열 | 담당 예 |
|------|---------|
| **svg-matrix** (여기) | `d`, winding, hit, filter markup, Figma bridge |
| **css-matrix** | `transform` on HTML, gradient spread, **timing / easing**, motion path CSS |
| **webgl-matrix** | mesh, shader, NURBS, GPU path raster |

[094](./lesson-094.md) JS motion은 svg sampling, **재생 타이밍**은 css-matrix가 깊습니다.

## 데모에서 볼 것

- monospace 표 **20행** — lesson ID · topic · Part  
- readout: `20 math topics — Parts 15–22 (lessons 068–087)`  
- 특정 주제를 찾았으면 사이드바에서 `lesson-0XX`로 이동  

## Core API

- `SVG_MATH_TOPIC_MAP` — `geometry.js`  
- 플러그인·문서 생성기에서 “커리큘럼 검색” 인덱스로 재사용 가능  

## 관련

- [055 SVG 한 장 지도](./lesson-055.md) — 전체 102강(Parts 0–25)  
- [ROADMAP](./ROADMAP.md) — 버전별 완료 표  

## 오늘의 핵심

068–087은 **편집기 엔진 레퍼런스**입니다. path 문법(003–024)을 본 뒤, 막히는 질문 유형으로 이 표에서 lesson 번호만 찾으면 됩니다. 다음 심화 권장: [079](./lesson-079.md)–[080](./lesson-080.md) (방금 다룬 transform).
