---
id: "002"
title: "transform attribute와 matrix"
part: "Part 0. SVG coordinate systems"
demo: "002"
---

# transform attribute와 matrix

SVG `transform`은 CSS `transform`과 같은 아이디어입니다. **좌표계를 바꾸는 함수**입니다.

<LessonDemo id="002" />

## 자주 쓰는 표기

```txt
translate(tx, ty)
rotate(angle cx cy)
scale(sx sy)
matrix(a b c d e f)
```

`matrix(a,b,c,d,e,f)`는 css-matrix에서 본 여섯 숫자와 같습니다.

## 누적

`<g transform="...">` 안의 자식은 부모 transform 이후 좌표계에서 그려집니다.

```txt
world = parent ∘ local
```

## 오늘의 핵심

path 편집기에서 핸들 좌표는 **path local**이고, 화면 overlay는 **viewport**입니다. 중간에 `getScreenCTM()` / `getCTM()`이 bridge입니다.
