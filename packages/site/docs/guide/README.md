---
title: "강의 구성"
---

# 강의 구성

SVG를 **렌더링·편집·변환의 1급 모델**로 다루는 독립 강의입니다. 전체 로드맵: [ROADMAP.md](./ROADMAP.md) · Figma filter 표: [figma-filter-mapping.md](./figma-filter-mapping.md)

## Part 0. SVG coordinate systems

- [001. viewBox와 user space](./lesson-001.md)
- [002. transform attribute와 matrix](./lesson-002.md)

## Part 1. Path grammar

- [003. path d 명령어 — M, L, Z](./lesson-003.md)
- [007. H, V — 축 정렬 직선](./lesson-007.md)
- [008. C — cubic Bézier](./lesson-008.md)
- [009. Q — quadratic Bézier](./lesson-009.md)
- [010. S, T — smooth continuation](./lesson-010.md)
- [011. A — elliptical arc](./lesson-011.md)
- [012. path bounding box](./lesson-012.md)

## Part 2. Stroke geometry

- [004. 점에서 stroke까지의 거리](./lesson-004.md)
- [005. join, cap, miter limit](./lesson-005.md)
- [006. stroke align과 outline 개념](./lesson-006.md)
- [013. miter length 공식](./lesson-013.md)

## Part 3. Fill rules (intro)

- [014. nonzero vs evenodd](./lesson-014.md)
- [015. fill hit testing](./lesson-015.md)

## Part 4. Path sampling

- [016. flatten tolerance](./lesson-016.md)
- [017. path length](./lesson-017.md)
- [018. point at length와 tangent](./lesson-018.md)

## Part 5. Paint servers (intro)

- [019. linearGradient 좌표](./lesson-019.md)
- [020. clipPath와 mask 개념](./lesson-020.md)

## Part 6. Path editor capstone

- [021. path handle 모델](./lesson-021.md)
- [022. handle hit testing](./lesson-022.md)
- [023. handle drag로 segment 갱신](./lesson-023.md)
- [024. mini path editor — SVG round-trip](./lesson-024.md)

## Part 7. Fill & winding deep dive

- [025. winding vs ray casting](./lesson-025.md)
- [026. compound path — 여러 subpath](./lesson-026.md)
- [027. self-intersection](./lesson-027.md)
- [028. path boolean](./lesson-028.md)
- [029. fill vs stroke hit 우선순위](./lesson-029.md)
- [030. scanline parity](./lesson-030.md)

## Part 8. Pattern & gradient

- [032. radialGradient](./lesson-032.md)
- [033. pattern tile](./lesson-033.md)
- [034. gradientUnits와 spreadMethod](./lesson-034.md)

## Part 9. SVG filter & Figma effects

- [031. Figma DROP_SHADOW → SVG filter](./lesson-031.md)
- [035. filter chain 개요](./lesson-035.md)
- [036. blur · offset · merge](./lesson-036.md)
- [037. inner shadow](./lesson-037.md)
- [038. layer blur vs background blur](./lesson-038.md)
- [039. Figma effect 매핑표 전체](./lesson-039.md)
- [Figma effect → SVG filter 매핑표](./figma-filter-mapping.md)

## Part 10. Figma ↔ SVG bridge

- [040. vector network vs path d](./lesson-040.md)
- [041. fill · stroke export](./lesson-041.md)
- [042. boolean operations export](./lesson-042.md)
- [043. mask · clip export](./lesson-043.md)
- [Figma node → SVG 매핑](./figma-bridge-mapping.md)

## Part 11. Icon design

- [044. pixel grid · optical alignment](./lesson-044.md)
- [045. fill vs stroke icons](./lesson-045.md)
- [046. symbol · sprite · currentColor](./lesson-046.md)
- [047. path simplification](./lesson-047.md)

## Appendix A. SVG in CSS

- [048. currentColor 아이콘](./lesson-048.md)
- [049. sprite · data URI](./lesson-049.md)
- [050. viewBox · export 최적화](./lesson-050.md)

`mask-image`, `clip-path: path()`, `vector-effect` 등 CSS 전용 주제는 [css-matrix](https://github.com/user/math/css-matrix) 부록을 참고하세요.

## Appendix B. Engine extras

- [051. stroke-dasharray · offset path](./lesson-051.md)
- [052. adaptive flatten](./lesson-052.md)
- [053. arc → cubic 변환](./lesson-053.md)
- [054. multi-subpath handle editing](./lesson-054.md)

## Part 12. Foundations primer

- [055. SVG 한 장 지도](./lesson-055.md)
- [056. 좌표 스택 — pointer → user space](./lesson-056.md)

## Part 13. Figma ↔ SVG (deep)

- [057. Figma paint types & gap map](./lesson-057.md)
- [058. radial · angular gradient export](./lesson-058.md)
- [059. image · pattern fill](./lesson-059.md)
- [060. stroke align export](./lesson-060.md)
- [061. blend mode · layer opacity](./lesson-061.md)
- [Figma paint gap map](./figma-paint-gap.md)

## Part 14. SVG spec breadth

- [062. markers](./lesson-062.md)
- [063. text · textPath](./lesson-063.md)
- [064. paint-order · opacity · filters](./lesson-064.md)
- [065. arc flatten 통합](./lesson-065.md)
