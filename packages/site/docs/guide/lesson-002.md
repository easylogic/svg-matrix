---
id: "002"
title: "transform attribute와 matrix"
part: "Part 0. SVG 기초"
demo: "svg-transform"
---

# transform attribute와 matrix

viewBox로 **카메라**를 잡았다면, `transform`은 **도형마다 로컬 좌표계**를 추가하는 도구입니다. CSS `transform`과 같은 계열이지만, SVG는 **요소 트리**라서 부모 `<g>`에 걸면 자식 path 전체가 같이 움직입니다.

<LessonDemo id="002" />

## transform은 함수다

“점 `(x,y)`를 받아 다른 점 `(x',y')`를 돌려준다” — 이게 transform입니다.

```xml
<g transform="translate(40, 20) scale(1.5)">
  <rect x="0" y="0" width="100" height="60"/>
</g>
```

rect의 로컬 좌표 `(0,0)`~(100,60)`은 그대로인데, **부모 g가 world로 가져다 놓는 위치**가 바뀝니다.

## 자주 쓰는 표기

| 함수 | SVG | 의미 |
|------|-----|------|
| 이동 | `translate(tx, ty)` | 원점 이동 |
| 회전 | `rotate(angle [cx cy])` | 각도(도), 기준점 |
| 스케일 | `scale(sx [sy])` | 축별 배율 |
| 행렬 | `matrix(a b c d e f)` | 일반 affine |

```txt
matrix(a,b,c,d,e,f)  ↔  CSS matrix(a,b,c,d,e,f)
```

`svg-matrix-core`의 `parseSvgMatrix`, `multiplySvgMatrix`, `applySvgMatrix`가 이 여섯 숫자를 다룹니다. css-matrix 강의와 **같은 수학**입니다.

## 누적 순서

`transform="translate(10,0) rotate(45) scale(2)"`는 **오른쪽부터** 적용됩니다 (SVG/CSS 모두).

```txt
p_world = T_translate · T_rotate · T_scale · p_local
```

편집기에서 “그룹 이동 후 회전”을 구현할 때, 내부적으로 matrix 곱 하나로 합치는 경우가 많습니다.

## g와 path local

전형적인 구조:

```xml
<svg viewBox="0 0 400 300">
  <g id="layer" transform="matrix(1 0 0 1 50 30)">
    <path d="M 0 0 L 100 0 L 50 80 Z"/>
  </g>
</svg>
```

- path의 `d` 좌표 = **g 기준 local**
- 화면 픽셀 = **svg root까지 CTM 누적**

핸들을 드래그할 때는 **local에서 수정**하고, overlay는 **screen 좌표**로 그립니다. bridge:

```txt
screen = CTM · local
local  = CTM⁻¹ · screen
```

브라우저 API: `SVGElement.getCTM()`, `getScreenCTM()`.

## 편집기에서의 transform

| 툴 동작 | 수학 |
|---------|------|
| 오브젝트 이동 | `translate(dx,dy)` |
| 리사이즈 | `scale` + anchor 보정 |
| 회전 | `rotate` around pivot |
| 그룹 | 부모 `g`에 matrix |

Figma의 frame/group = SVG의 `<g transform>`. export 시 matrix로 풀리기도 하고, `translate/rotate/scale`로 풀리기도 합니다.

## CSS transform과의 차이 (짧게)

- **SVG attribute** — 요소별, presentation attribute
- **CSS transform** — 스타일, 일부 SVG 요소에도 적용 가능
- **computed style** — cascade 후 최종 matrix

벡터 편집기 export에서는 보통 attribute 쪽이 명시적입니다. css-matrix에서 **DOM + CSS** 쪽을 더 깊게 봅니다.

## 오늘의 핵심

- `transform`은 좌표계를 바꾸는 **affine 함수**다.
- 부모 `g` → 자식으로 **누적**된다.
- path 편집 = local, hit test overlay = screen, 둘 사이가 **CTM**이다.

Part 0을 마칩니다. 다음 Part 1부터 [003 path d](./lesson-003.md)로 들어갑니다. 그 전에 [067 기본 도형](./lesson-067.md)으로 SVG 트리 감각을 한 번 더 잡아도 좋습니다.
