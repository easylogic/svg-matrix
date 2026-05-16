---
id: "000"
title: "SVG란 무엇인가"
part: "Part 0. SVG 기초"
demo: "svg-what-is"
---

# SVG란 무엇인가

이 강의 시리즈는 **SVG Graphics Geometry**입니다. 첫 강의부터 `viewBox`나 `path d`를 만지기 전에, SVG가 **무엇인지**부터 잡고 갑니다. 좌표식이 어렵다고 느껴지는 이유는, 종종 “도형이 어떻게 그려지는지”보다 “숫자가 어디 기준인지”가 먼저 헷갈리기 때문입니다. 그래서 Part 0은 path 문법(Part 1)보다 **세계관**을 먼저 세웁니다.

<LessonDemo id="000" />

## SVG 한 줄 정의

**SVG(Scalable Vector Graphics)** 는 **벡터 그래픽을 XML로 표현한 포맷**이고, 동시에 브라우저 안에서는 **`<svg>` DOM 요소**로 살아 있습니다.

```xml
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#2563eb"/>
</svg>
```

위 코드는 “이미지 파일”이면서 동시에 “문서 구조”입니다. 픽셀 격자에 색을 찍는 방식이 아니라, **원이라는 기하 정보**와 **파란색이라는 페인트 정보**를 적어 둔 것입니다.

## 비트맵(PNG)과 무엇이 다른가

| | PNG / JPEG | SVG |
|---|------------|-----|
| 저장 단위 | 픽셀 색 배열 | 점·선·곡선·채우기 규칙 |
| 확대 | 흐려짐(보간) | 선명(재계산) |
| 편집 | 픽셀 편집기 | 노드·경로·속성 |
| 용량 | 해상도에 비례 | 복잡도에 비례 |

아이콘·로고·UI 일러스트·Figma export에 SVG가 쓰이는 이유는, **크기를 바꿔도 윤곽이 유지**되기 때문입니다. 사진은 SVG가 아닙니다. 사진은 비트맵이 맞습니다.

## Canvas와도 다르다

**Canvas**는 비트맵에 가깝습니다. `fillRect`, `lineTo`로 **그 순간의 픽셀 버퍼**에 그립니다. 확대하면 다시 그려야 하고, 객체 단위 선택·편집이 어렵습니다.

**SVG**는 **장면 그래프(scene graph)** 입니다. `<circle>`, `<path>`가 DOM 노드로 남고, 속성을 바꾸면 브라우저가 다시 래스터화합니다.

```txt
Canvas  → 그리기 명령 → 픽셀
SVG     → 요소 트리 + 속성 → (브라우저가) 픽셀
```

Figma·Illustrator·벡터 편집기를 만들 때는 보통 **내부 모델 → SVG export** 또는 **SVG import** 파이프라인이 있습니다. 이 강의의 `svg-matrix-core`는 그 **중간 계층의 수학**을 다룹니다.

## SVG가 담는 것 (이 강의 지도)

Part 0~14에서 다루는 범위를 미리 보면:

1. **좌표계** — user space, viewBox, transform (Part 0)
2. **path d** — M/L/C/Q/A, segment graph (Part 1)
3. **stroke / fill** — 거리, join, winding, hit test (Part 2–3)
4. **paint server** — gradient, pattern, clip, mask (Part 5, 8)
5. **filter** — blur, shadow (Part 9)
6. **Figma bridge** — vector network, paint export (Part 10)
7. **아이콘·스프라이트** — grid, symbol, simplify (Part 11)

[055. SVG 한 장 지도](./lesson-055.md)에서 시리즈 전체와 `css-matrix`·`webgl-webgpu-matrix` 분담도 정리합니다.

## SVG를 어디에 쓰나

- **인라인 SVG** — React/Vue 컴포넌트 안 `<svg>`, `currentColor`로 테마 연동
- **스프라이트** — `<symbol>` + `<use>`, 아이콘 폰트 대체
- **배경** — `background-image: url(...svg)` (css-matrix와 겹침)
- **편집기 export** — Figma, Illustrator, Inkscape
- **애니메이션** — [Part 23](./lesson-088.md) SMIL·dash draw·offset-path·morph (088–094)

## 편집기를 만들 때의 위치

사용자가 펜으로 그린 것 → 내부 **vector network / segment** → export 시 **`path d` 문자열**.

```txt
Figma vector network  →  svg-matrix-core  →  <path d="M … C … Z"/>
```

SVG는 “최종 파일 형식”이기도 하지만, **API 계약**이기도 합니다. `parsePathD`, `pathDFromSegments`, `viewBoxToViewport` 같은 함수는 모두 “브라우저·디자인 툴이 기대하는 SVG 의미”를 코드로 옮긴 것입니다.

## 이 시리즈에서 다루지 않는 것

- HTML 레이아웃, flex, grid → **css-matrix**
- GPU 셰이더, 삼각형 래스터 → **webgl-webgpu-matrix**
- 타이포그래피 전체(글리프 힌팅) → 별도 주제

SVG **geometry·paint·filter**에 집중합니다.

## 데모에서 볼 것

같은 단순 도형을 **비트맵(캔버스에 그린 픽셀)** 과 **SVG(원 요소)** 로 나란히 두고 확대해 봅니다. SVG 쪽은 확대해도 윤곽이 날카롭게 유지되는 이유를 눈으로 확인합니다.

## 오늘의 핵심

- SVG는 **벡터 장면을 XML/DOM으로 표현**한 것이다.
- **path d**는 그중 가장 유연한 도형 표현이지만, Part 0·기본 도형을 거친 뒤가 안전하다.
- 다음: [001 viewBox](./lesson-001.md)에서 “SVG만의 좌표계”로 들어간다.
