---
id: "022"
title: "handle hit testing"
part: "Part 6. Path editor capstone"
demo: "handle-hit"
---

# handle hit testing

path 위를 클릭했을 때 **어떤 anchor/control handle**을 잡았는지 고릅니다. stroke/fill hit보다 단순합니다: **반경 안에서 가장 가까운 handle** 하나를 선택합니다.

<LessonDemo id="022" />

## 데모에서 볼 것

- `createPathEditor` — `SAMPLE_PATH_D` cubic path, **드래그 비활성** (`allowDrag: false`)  
- **pointermove** — 커서 근처 handle hit (radius **12** user units)  
- readout: `pointer=(x,y)` → `HIT a:2 [anchor]` 또는 `no handle`  

```js
// 데모와 동일: handles 배열에 대해 hit
const hit = hitTestPathHandles(point, handles, 12);
```

## handle 목록

```js
import { listPathHandles, pathFromD } from "svg-matrix-core";

const { segments } = pathFromD(d);
const handles = listPathHandles(segments);
// [
//   { id: "a:0", kind: "anchor", segmentIndex: 0, point: {x,y} },
//   { id: "c1:2", kind: "control", role: "cp1", segmentIndex: 2, point: {x,y} },
//   ...
// ]
```

cubic segment마다 anchor 1개 + control 2개가 붙습니다.

## hit test

```js
import { listPathHandles, hitTestPathHandles, pathFromD } from "svg-matrix-core";

const { segments } = pathFromD(d);
const handles = listPathHandles(segments);
const hit = hitTestPathHandles(pointer, handles, radius);
// null | { id, kind, segmentIndex, point, ... }
```

`radius`는 **user space** 단위(보통 6–10px). 화면 픽셀 반경을 쓰려면 [001](./lesson-001.md)처럼 zoom으로 나눠 user space radius로 바꿉니다.

## 화면 좌표 → SVG 좌표

`path-editor.js`의 `clientToSvg`:

```js
function clientToSvg(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  return {
    x: vb.x + ((clientX - rect.left) / rect.width) * vb.width,
    y: vb.y + ((clientY - rect.top) / rect.height) * vb.height
  };
}
```

Canvas 편집기도 **inverse view transform** 후 동일한 `hitTestPathHandles`를 호출합니다.

## 우선순위 (실무)

1. **handle hit** (가장 작은 반경, 최우선)  
2. **stroke hit**  
3. **fill hit**  
4. 아무것도 아니면 선택 해제 / box select  

[029](./lesson-029.md)에서 2·3을 다룹니다.

## Core API

- `listPathHandles`, `hitTestPathHandles`
- `listSubpathHandles`, `hitTestSubpathHandles` — compound path
- UI: `packages/lesson_runtime/path-editor.js` → `createPathEditor`

## 다음

- [023](./lesson-023.md) — handle drag로 segment 갱신

## 오늘의 핵심

handle hit은 거리장이 아니라 **유한 개의 점**에 대한 nearest-neighbor입니다. 편집기는 d 문자열이 아니라 **segment graph + handle id**로 상태를 유지합니다.
