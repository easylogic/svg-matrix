---
id: "067"
title: "SVG 문서 구조와 기본 도형"
part: "Part 0. SVG 기초"
demo: "svg-basics"
---

# SVG 문서 구조와 기본 도형

path `d` 문자열로 바로 들어가기 전에, SVG **문서가 어떻게 생겼는지** 봅니다. 대부분의 export 파일은 `<svg>` 루트 아래에 `<g>`, `<defs>`, 그리고 여러 **기본 도형** 또는 `<path>`가 있습니다.

<LessonDemo id="067" />

## 최소 문서 골격

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <!-- 재사용 정의: gradient, clipPath, symbol … -->
  </defs>
  <g id="content">
  <rect x="10" y="10" width="80" height="50" fill="#2563eb"/>
  <circle cx="140" cy="60" r="35" fill="#f59e0b"/>
  </g>
</svg>
```

- **`xmlns`** — SVG 네임스페이스 (XML 파서용)
- **`viewBox`** — [001](./lesson-001.md)에서 본 user space 영역
- **`defs`** — 화면에 바로 그려지지 않고 `url(#id)`로 참조
- **`g`** — 그룹, `transform`·`opacity`를 묶어서 적용

## 기본 도형 vs path

| 요소 | 속성 | 언제 쓰나 |
|------|------|-----------|
| `rect` | `x,y,width,height,rx,ry` | 사각형, 둥근 모서리 |
| `circle` | `cx,cy,r` | 원 |
| `ellipse` | `cx,cy,rx,ry` | 타원 |
| `line` | `x1,y1,x2,y2` | 무한 직선 segment |
| `polyline` | `points` | 열린 꺾은선 |
| `polygon` | `points` | 닫힌 꺾은선 |
| `path` | `d` | 모든 곡선·복합 형태 |

Figma에서 사각형·원은 단순 파라미터로 저장되다가, export 시 **전부 `<path d>`로 합쳐지는 경우**가 많습니다. 편집기 내부는 타입을 유지하고, SVG는 path로 flatten하는 식입니다.

## fill과 stroke (첫 만남)

```xml
<rect fill="#2563eb" fill-opacity="0.8"
      stroke="#1e293b" stroke-width="2"/>
```

- **fill** — 닫힌 영역 안쪽 paint ([014 fill rule](./lesson-014.md))
- **stroke** — 윤곽선 중심선 + 두께 ([004 stroke hit](./lesson-004.md))

Part 2·3에서 기하적으로 깊게 봅니다. 지금은 “속성 두 줄이 페인트다”만 기억하면 됩니다.

## defs와 참조

gradient·clip·mask·symbol은 보통 `defs` 안에 id를 달아 둡니다.

```xml
<defs>
  <linearGradient id="g1">…</linearGradient>
</defs>
<rect fill="url(#g1)" …/>
```

[019 linearGradient](./lesson-019.md), [020 clip/mask](./lesson-020.md)에서 다시 만납니다.

## 왜 path로 가는가

기본 도형은 사람이 읽기 쉽습니다. 하지만 **펜툴·불리언·Figma vector network**는 결국 임의 곡선입니다. SVG의 공통 분모가 **`path d`** 인 이유입니다.

```txt
rect/circle  →  편집기 내부 타입
            →  export 시 path d 로 통일되는 경우 많음
```

[003 M/L/Z](./lesson-003.md)부터 `d`를 segment graph로 파싱합니다.

## DOM으로 접근

브라우저에서 SVG는 XML DOM입니다.

```js
const svg = document.querySelector("svg");
const circle = svg.querySelector("circle");
circle.setAttribute("r", "50"); // user space 반경 변경
```

Canvas와 달리 **요소 단위**로 속성을 바꿀 수 있습니다. 이것이 에디터·애니메이션·접근성에 유리한 이유입니다.

## 데모에서 볼 것

여러 기본 도형과 `path`, `g`, `defs`를 한 장면에 두고, 요소를 골라 **어떤 속성이 바뀌는지** 봅니다. path로 가기 전 “SVG가 HTML처럼 트리다”는 감각을 확인하세요.

## 오늘의 핵심

- SVG는 **트리 구조** + **기본 도형** + (필요 시) **path**.
- `defs` + `url(#id)` 로 paint·clip 재사용.
- 다음: [003 path d — M, L, Z](./lesson-003.md).
