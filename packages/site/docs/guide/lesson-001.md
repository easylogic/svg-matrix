---
id: "001"
title: "viewBox와 user space"
part: "Part 0. SVG 기초"
demo: "viewbox"
---

# viewBox와 user space

[이전 강의](./lesson-000.md)에서 SVG가 벡터 장면이라는 것을 봤습니다. 이제 **그 장면 안의 좌표**를 봅니다. HTML/CSS에서 `width: 200px`은 “DOM 레이아웃 박스” 이야기이고, `<svg viewBox="0 0 160 100">` 안의 `(10, 20)`은 **SVG user space** 이야기입니다. **같은 화면에도 좌표계가 둘 이상** 있습니다.

<LessonDemo id="001" />

## user space란

SVG 요소에 `width="320" height="200"`을 주면, 브라우저는 **뷰포트(viewport)** 라는 사각형을 만듭니다. 그 안에 그림을 그립니다.

그림을 그릴 때 쓰는 숫자 좌표계가 **user space** (또는 current user coordinate system) 입니다. 기본적으로 **viewBox가 없으면** user space 한 단위 ≈ viewport 한 단위(픽셀에 가깝게)입니다.

```xml
<svg width="320" height="200">
  <!-- (0,0)은 svg 박스의 왼쪽 위 -->
  <rect x="10" y="20" width="80" height="50" fill="tomato"/>
</svg>
```

`x="10" y="20"`은 CSS margin이 아닙니다. **SVG 좌표 평면** 위의 위치입니다.

## viewBox는 “카메라가 비출 영역”

`viewBox`는 user space에서 **어느 사각형을 잘라서 viewport에 맞출지** 정합니다.

```txt
viewBox = minX minY width height
```

예: `viewBox="0 0 160 100"`

- user space에서 `(0,0)` ~ `(160,100)` 영역이 논리적 “캔버스”
- 실제 `<svg width="320" height="200">` 이면 브라우저가 **2배 확대**해서 맞춤 (비율 유지 시)

도형의 `x,y,width,height` 숫자는 **viewBox가 바뀌어도 그대로**입니다. 바뀌는 것은 **화면에 보이는 크기·여백**뿐입니다. Figma에서 zoom을 바꿔도 프레임 안 도형 좌표는 그대로인 것과 같습니다.

## preserveAspectRatio

viewport와 viewBox 비율이 다르면 어떻게 맞출지 규칙이 필요합니다.

```txt
preserveAspectRatio = [x-align y-align] [meet | slice]
```

| 값 | 의미 |
|----|------|
| `meet` (기본) | 전체가 다 보이게 uniform scale, 여백 생길 수 있음 |
| `slice` | viewport를 꽉 채우게 scale, 잘릴 수 있음 |
| `xMidYMid` 등 | 정렬 (왼쪽/가운데/오른쪽, 위/가운데/아래) |

편집기에서 “캔버스 맞춤 보기”를 구현할 때도 같은 결정입니다. **uniform scale** 하나와 **정렬** 하나로 끝납니다.

## DOM pixel과 SVG user space

| 좌표 | 기준 | 쓰임 |
|------|------|------|
| `clientX/Y` | 브라우저 viewport | pointer 이벤트 |
| SVG user space | viewBox + transform | `x`, `y`, `path d` |
| Screen CTM | 누적 transform 후 | `getScreenCTM()` |

마우스를 SVG 위에서 잡을 때:

```txt
pointer (client) → SVG element rect → user space (inverse CTM)
```

[002 transform](./lesson-002.md)에서 `<g transform>`이 이 사슬에 어떻게 끼는지 봅니다.

## 왜 편집기가 viewBox를 신경 쓰나

- **아이콘** — `viewBox="0 0 24 24"` 관례, `width/height`만 바꿔 스케일
- **반응형 SVG** — `width="100%"` + viewBox로 비율 유지
- **줌/팬** — viewBox의 minX/minY/width/height를 바꾸는 것과 동치에 가깝음
- **export** — Illustrator artboard ↔ SVG viewBox 매핑

`svg-matrix-core`의 `parseViewBox`, `viewBoxToViewport`는 이 매핑을 코드로 옮긴 것입니다.

## 흔한 실수

1. **viewBox 없이 %만 씀** — 기대와 다른 스케일
2. **viewBox width/height 0** — 정의되지 않은 동작
3. **user space와 CSS px 혼동** — selection box가 어긋남
4. **transform 없이 client 좌표를 path에 직접 대입** — zoom/rotate 시 틀어짐

## 데모에서 볼 것

슬라이더로 `viewBox`의 minX, minY, width, height를 바꿉니다. 삼각형·프레임의 **user space 좌표는 고정**이고, **화면에서의 크기·위치**만 변하는지 확인하세요.

## 오늘의 핵심

- SVG 좌표는 **user space**에서 읽는다.
- **viewBox**는 그 user space의 어느 영역을 viewport에 맞출지 정한다.
- 다음: [067 기본 도형](./lesson-067.md) → [002 transform](./lesson-002.md) → [003 path](./lesson-003.md).
