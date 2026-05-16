---
id: "001"
title: "viewBox와 user space"
part: "Part 0. SVG coordinate systems"
demo: "001"
---

# viewBox와 user space

SVG는 HTML 위에 그려지지만, **좌표는 DOM pixel과 다릅니다.** `<svg>` 안의 `(10, 20)`은 user space의 점이고, 브라우저가 viewport 크기에 맞게 확대·축소합니다.

<LessonDemo id="001" />

## viewBox는 카메라

```txt
viewBox = minX minY width height
```

`viewBox="0 0 160 100"`이면 user space에서 `(0,0)`–`(160,100)` 사각형이 보입니다.

## preserveAspectRatio

```txt
preserveAspectRatio = [align] [meet|slice]
```

- `meet`: 전체가 보이도록 uniform scale (여백 가능)
- `slice`: viewport를 채우도록 uniform scale (잘릴 수 있음)

데모에서 viewBox를 바꿔 보세요. 도형 숫자는 그대로인데 화면에서의 크기와 여백이 바뀝니다.

## 오늘의 핵심

SVG 편집기를 만들 때는 항상 **어느 space의 좌표인지** 이름표를 붙이세요. pointer → viewport → user space → local path space.
