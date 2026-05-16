export const LESSONS = [
  {
    id: "001",
    part: "Part 0. SVG coordinate systems",
    title: "viewBox와 user space",
    goal: "SVG user space, viewBox, preserveAspectRatio가 화면 좌표로 어떻게 매핑되는지 이해한다.",
    demo: "viewbox",
    takeaways: [
      "SVG 좌표는 DOM pixel과 별개의 user space다.",
      "viewBox는 카메라가 비출 영역을 정한다.",
      "meet/slice와 alignment는 aspect ratio를 유지한 채 viewport에 맞춘다."
    ]
  },
  {
    id: "002",
    part: "Part 0. SVG coordinate systems",
    title: "transform attribute와 matrix",
    goal: "SVG transform을 2D affine으로 읽고 local/world 좌표를 구분한다.",
    demo: "svg-transform",
    takeaways: [
      "SVG transform은 좌표계를 바꾸는 함수다.",
      "matrix(a,b,c,d,e,f)는 CSS matrix와 같은 여섯 숫자다.",
      "g 요소 transform은 자식 좌표에 누적된다."
    ]
  },
  {
    id: "003",
    part: "Part 1. Path grammar",
    title: "path d 명령어 — M, L, Z",
    goal: "path data 문자열을 segment 목록으로 파싱하고 다시 d로 직렬화한다.",
    demo: "path-grammar",
    takeaways: [
      "path는 그리기 명령의 스택이 아니라 segment 연결이다.",
      "M은 subpath 시작, L은 직선, Z는 subpath 닫기다.",
      "편집기 내부 모델은 d 문자열보다 segment graph가 다루기 쉽다."
    ]
  },
  {
    id: "004",
    part: "Part 2. Stroke geometry",
    title: "점에서 stroke까지의 거리",
    goal: "stroke hit testing을 점-선분 최단거리 문제로 구현한다.",
    demo: "stroke-hit",
    takeaways: [
      "stroke hit은 fill hit과 다른 기하 문제다.",
      "얇은 선은 helper stroke로 hit area를 넓힌다.",
      "distance <= strokeWidth / 2 가 기본 판정식이다."
    ]
  },
  {
    id: "005",
    part: "Part 2. Stroke geometry",
    title: "join, cap, miter limit",
    goal: "stroke-linejoin, stroke-linecap, stroke-miterlimit이 모서리에서 만드는 형태를 본다.",
    demo: "stroke-style",
    takeaways: [
      "miter는 두 방향을 연장한 교점이다.",
      "miter limit을 넘으면 bevel로 fallback한다.",
      "round cap은 끝점에 반원을 붙인다."
    ]
  },
  {
    id: "006",
    part: "Part 2. Stroke geometry",
    title: "stroke align과 outline 개념",
    goal: "center/inside/outside stroke가 왜 SVG/CSS에서 다르게 표현되는지 정리한다.",
    demo: "stroke-align",
    takeaways: [
      "SVG stroke는 path 중심선을 따라 그린다.",
      "inside/outside stroke는 별도 outline path가 필요하다.",
      "Figma stroke align은 geometry offset 문제다."
    ]
  },
  {
    id: "007",
    part: "Part 1. Path grammar",
    title: "H, V — 축 정렬 직선",
    goal: "horizontal/vertical 명령이 L segment로 정규화되는지 확인한다.",
    demo: "path-hv",
    takeaways: [
      "H/V는 편의 문법이고 내부 모델은 L이다.",
      "상대 h/v는 현재 점 기준으로 한 축만 이동한다.",
      "직교 다이어그램·UI wireframe에 자주 쓰인다."
    ]
  },
  {
    id: "008",
    part: "Part 1. Path grammar",
    title: "C — cubic Bézier",
    goal: "cubic control point 두 개와 flatten sampling의 관계를 본다.",
    demo: "path-cubic",
    takeaways: [
      "C는 네 점(p0, cp1, cp2, p3)으로 곡선을 정의한다.",
      "렌더·hit test는 보통 flatten한 polyline으로 근사한다.",
      "control handle이 곡선 밖에 있어도 유효하다."
    ]
  },
  {
    id: "009",
    part: "Part 1. Path grammar",
    title: "Q — quadratic Bézier",
    goal: "quadratic segment를 파싱하고 cubic보다 단순한 제어점 구조를 이해한다.",
    demo: "path-quad",
    takeaways: [
      "Q는 control point 하나로 곡선을 만든다.",
      "임의 cubic은 quadratic으로 정확히 표현되지 않는다.",
      "폰트·아이콘 outline에 quadratic이 많다."
    ]
  },
  {
    id: "010",
    part: "Part 1. Path grammar",
    title: "S, T — smooth continuation",
    goal: "이전 segment control을 반사(reflect)해 연속 곡선을 만드는 규칙을 본다.",
    demo: "path-smooth",
    takeaways: [
      "S는 이전 C의 cp2를 반사해 cp1을 자동 생성한다.",
      "T는 이전 Q의 cp를 반사한다.",
      "필기·프리드로우 path에서 매끄러운 연결이 목적이다."
    ]
  },
  {
    id: "011",
    part: "Part 1. Path grammar",
    title: "A — elliptical arc",
    goal: "arc 명령 파라미터(rx, ry, rotation, flags)와 flatten 근사를 연결한다.",
    demo: "path-arc",
    takeaways: [
      "A는 타원 호 한 개를 정의한다.",
      "large-arc/sweep flag로 같은 끝점 사이 두 호 중 하나를 고른다.",
      "엔진은 arc를 line/cubic segment로 변환해 다루는 경우가 많다."
    ]
  },
  {
    id: "012",
    part: "Part 1. Path grammar",
    title: "path bounding box",
    goal: "flatten된 점들로 path bbox를 계산하고 selection UI에 쓰는 법을 본다.",
    demo: "path-bbox",
    takeaways: [
      "bbox는 control point만으로는 부족할 수 있다.",
      "곡선은 sampling 후 min/max를 잡는 것이 안전하다.",
      "selection marquee는 bbox + padding으로 그린다."
    ]
  },
  {
    id: "013",
    part: "Part 2. Stroke geometry",
    title: "miter length 공식",
    goal: "join 각도와 stroke width로 miter spike 길이를 계산하고 limit과 비교한다.",
    demo: "miter-math",
    takeaways: [
      "miter length = (strokeWidth/2) / sin(joinAngle/2).",
      "limit 초과 시 bevel로 바꾸는 것이 SVG 규칙이다.",
      "편집기 preview는 브라우저와 같은 수식을 쓰면 일치한다."
    ]
  },
  {
    id: "014",
    part: "Part 3. Fill rules",
    title: "nonzero vs evenodd",
    goal: "winding number로 fill-rule 차이를 시각화한다.",
    demo: "fill-rule",
    takeaways: [
      "nonzero는 winding ≠ 0이면 inside다.",
      "evenodd는 교차 횟수가 홀수면 inside다.",
      "구멍 있는 도형·self-intersection에서 결과가 달라진다."
    ]
  },
  {
    id: "015",
    part: "Part 3. Fill rules",
    title: "fill hit testing",
    goal: "pointer 위치가 path 내부인지 segment flatten + winding으로 판정한다.",
    demo: "fill-hit",
    takeaways: [
      "fill hit은 stroke hit보다 polygon 문제에 가깝다.",
      "곡선 path는 먼저 flatten한다.",
      "fill-rule을 hit test에도 동일하게 적용한다."
    ]
  },
  {
    id: "016",
    part: "Part 4. Path sampling",
    title: "flatten tolerance",
    goal: "stepsPerCurve로 곡선 근사 정밀도와 성능 trade-off를 조절한다.",
    demo: "path-flatten",
    takeaways: [
      "더 많은 step → 더 정확한 stroke/fill/bbox.",
      "편집 중에는 coarse, export 시 fine sampling을 쓰기도 한다.",
      "adaptive flatten은 곡률에 따라 step을 바꾼다."
    ]
  },
  {
    id: "017",
    part: "Part 4. Path sampling",
    title: "path length",
    goal: "polyline 누적 길이로 path 전체 길이를 구한다.",
    demo: "path-length",
    takeaways: [
      "곡선 길이는 적분이지만 실무는 flatten 후 합산이다.",
      "stroke-dasharray, motion path, 텍스트-on-path에 쓰인다.",
      "closed path는 마지막 segment까지 포함한다."
    ]
  },
  {
    id: "018",
    part: "Part 4. Path sampling",
    title: "point at length와 tangent",
    goal: "거리 s에서의 점과 접선 방향을 구해 motion/arrow head에 활용한다.",
    demo: "path-point",
    takeaways: [
      "pointAtLength는 flatten polyline 위에서 선형 보간한다.",
      "tangent는 해당 segment 방향이다.",
      "정밀한 arc length는 더 촘촘한 flatten이 필요하다."
    ]
  },
  {
    id: "019",
    part: "Part 5. Paint servers",
    title: "linearGradient 좌표",
    goal: "userSpaceOnUse vs objectBoundingBox에서 gradient stop 파라미터 t를 계산한다.",
    demo: "gradient-units",
    takeaways: [
      "gradient는 선형 함수로 색을 보간한다.",
      "objectBoundingBox는 0–1 정규화 좌표다.",
      "Figma gradient handle은 이 선형 변환과 대응된다."
    ]
  },
  {
    id: "020",
    part: "Part 5. Paint servers",
    title: "clipPath와 mask 개념",
    goal: "clip(하드 마스크)과 mask(알파 마스크)가 geometry pipeline 어디에 끼는지 본다.",
    demo: "clip-mask",
    takeaways: [
      "clipPath는 inside/outside 이진 판정이다.",
      "mask는 알파로 부드럽게 가릴 수 있다.",
      "편집기 레이어 트리는 paint order + clip stack으로 모델링한다."
    ]
  },
  {
    id: "021",
    part: "Part 6. Path editor capstone",
    title: "path handle 모델",
    goal: "segment graph에서 anchor와 Bézier control handle 목록을 추출한다.",
    demo: "path-handles",
    takeaways: [
      "anchor는 path 위의 꼭짓점이다.",
      "control handle은 C/Q segment의 cp1/cp2/cp다.",
      "편집기 UI는 handle 배열을 그린다."
    ]
  },
  {
    id: "022",
    part: "Part 6. Path editor capstone",
    title: "handle hit testing",
    goal: "pointer가 어떤 handle을 잡았는지 반경 기반으로 판정한다.",
    demo: "handle-hit",
    takeaways: [
      "handle hit은 stroke/fill hit보다 단순하다.",
      "가장 가까운 handle을 고른다.",
      "zoom에 따라 hit radius를 screen space로 보정한다."
    ]
  },
  {
    id: "023",
    part: "Part 6. Path editor capstone",
    title: "handle drag로 segment 갱신",
    goal: "handle 이동 시 segment graph와 d 문자열을 동기화한다.",
    demo: "handle-drag",
    takeaways: [
      "updatePathHandle이 segment를 수정한다.",
      "syncPathEndpoints로 from/to 연결을 유지한다.",
      "드래그 중에도 pathDFromSegments로 SVG를 갱신한다."
    ]
  },
  {
    id: "024",
    part: "Part 6. Path editor capstone",
    title: "mini path editor — SVG round-trip",
    goal: "d 파싱 → 편집 → d보내기 파이프라인을 한 화면에서 완성한다.",
    demo: "path-editor",
    takeaways: [
      "pathFromD / pathDFromSegments가 round-trip이다.",
      "Figma vector는 결국 이 pipeline 위에 attribute가 얹힌다.",
      "다음 단계는 webgl-webgpu-matrix로 같은 geometry를 GPU에 올리는 것이다."
    ]
  },
  {
    id: "025",
    part: "Part 7. Fill & winding deep dive",
    title: "winding vs ray casting",
    goal: "winding number와 ray crossing parity가 같은 판정을 어떻게 다른 방식으로 계산하는지 비교한다.",
    demo: "winding-compare",
    takeaways: [
      "nonzero는 winding ≠ 0.",
      "evenodd는 crossing 횟수가 홀수.",
      "classifyPointInPath가 두 값을 한 번에 반환한다."
    ]
  },
  {
    id: "026",
    part: "Part 7. Fill & winding deep dive",
    title: "compound path — 여러 subpath",
    goal: "M이 여러 번 나오는 compound path에서 hole과 ring이 fill-rule에 따라 어떻게 달라지는지 본다.",
    demo: "compound-path",
    takeaways: [
      "segmentsToSubpaths가 M 기준으로 나눈다.",
      "hole은 inner subpath winding을 반대로.",
      "SVG는 subpath 합산 후 fill-rule 한 번 적용."
    ]
  },
  {
    id: "027",
    part: "Part 7. Fill & winding deep dive",
    title: "self-intersection",
    goal: "스스로 교차하는 path에서 fill-rule이 면을 어떻게 나누는지 시각화한다.",
    demo: "self-intersect",
    takeaways: [
      "교차는 winding/crossing 둘 다 바꾼다.",
      "별·리본 형태는 evenodd가 직관적.",
      "편집기 boolean 전에 규칙을 정해야 한다."
    ]
  },
  {
    id: "028",
    part: "Part 7. Fill & winding deep dive",
    title: "path boolean",
    goal: "union/subtract/intersect/exclude를 point sampling으로 정의하고 Figma boolean과 연결한다.",
    demo: "path-boolean",
    takeaways: [
      "boolean = inA/inB 조합.",
      "실무는 polygon clip 또는 raster.",
      "pointInPathBoolean은 개념 데모."
    ]
  },
  {
    id: "029",
    part: "Part 7. Fill & winding deep dive",
    title: "fill vs stroke hit 우선순위",
    goal: "같은 pointer에서 stroke hit과 fill hit이 겹칠 때 편집기 선택 정책을 정한다.",
    demo: "hit-priority",
    takeaways: [
      "stroke는 거리, fill은 winding.",
      "보통 stroke가 우선 또는 가장 작은 target.",
      "helper stroke width로 hit tolerance."
    ]
  },
  {
    id: "030",
    part: "Part 7. Fill & winding deep dive",
    title: "scanline parity",
    goal: "scanline이 edge crossing으로 fill을 채우는 과정을 한 줄로 시각화한다.",
    demo: "scanline",
    takeaways: [
      "rasterizer의 기본 루프.",
      "evenodd = parity flip.",
      "GPU path fill도 결국 coverage."
    ]
  },
  {
    id: "032",
    part: "Part 8. Pattern & gradient",
    title: "radialGradient",
    goal: "중심·초점·반경으로 radial stop 파라미터 t를 계산하고 색을 샘플링한다.",
    demo: "radial-gradient",
    takeaways: [
      "radialGradientStopParameter / sampleRadialGradient.",
      "fx/fy는 focal point.",
      "Figma radial gradient handle과 같은 축."
    ]
  },
  {
    id: "033",
    part: "Part 8. Pattern & gradient",
    title: "pattern tile",
    goal: "pattern 반복에서 pointer 위치의 tile (u,v)와 patternUnits를 이해한다.",
    demo: "pattern-tile",
    takeaways: [
      "patternTileCoordinates.",
      "buildPatternMarkup.",
      "아이콘·배경 격자에 사용."
    ]
  },
  {
    id: "034",
    part: "Part 8. Pattern & gradient",
    title: "gradientUnits와 spreadMethod",
    goal: "objectBoundingBox vs userSpaceOnUse와 pad/repeat/reflect spread를 적용한다.",
    demo: "gradient-spread",
    takeaways: [
      "sampleLinearGradient + applySpreadMethod.",
      "spreadMethod는 t를 0–1 밖에서 어떻게 볼지.",
      "css-matrix gradient 강의와 짝."
    ]
  },
  {
    id: "031",
    part: "Part 9. SVG filter & Figma effects",
    title: "Figma DROP_SHADOW → SVG filter",
    goal: "Figma drop shadow 필드를 feDropShadow로 매핑하고 filter markup을 생성한다.",
    demo: "figma-filter",
    takeaways: [
      "figmaDropShadowToSvgFilter.",
      "radius ≈ stdDeviation×2.",
      "figma-filter-mapping.md 참고."
    ]
  },
  {
    id: "035",
    part: "Part 9. SVG filter & Figma effects",
    title: "filter chain 개요",
    goal: "fe* primitive가 result 이름으로 연결되는 DAG를 읽고 buildSvgFilter로 조립한다.",
    demo: "filter-chain",
    takeaways: [
      "filter는 pixel pipeline이다.",
      "buildFilterPrimitive / buildSvgFilter.",
      "filter region은 blur 잘림을 방지한다."
    ]
  },
  {
    id: "036",
    part: "Part 9. SVG filter & Figma effects",
    title: "blur · offset · merge",
    goal: "feDropShadow 한 줄 대신 GaussianBlur→Offset→Flood→Composite→Merge 체인을 만든다.",
    demo: "filter-blur-merge",
    takeaways: [
      "buildDropShadowFilterChain.",
      "SourceAlpha vs SourceGraphic.",
      "feMerge로 shadow 위에 원본."
    ]
  },
  {
    id: "037",
    part: "Part 9. SVG filter & Figma effects",
    title: "inner shadow",
    goal: "Figma INNER_SHADOW를 안쪽으로 clip하는 feComposite 체인으로 변환한다.",
    demo: "filter-inner",
    takeaways: [
      "figmaInnerShadowToSvgFilter.",
      "shadow ∩ SourceAlpha = inner.",
      "Figma inside effect와 연결."
    ]
  },
  {
    id: "038",
    part: "Part 9. SVG filter & Figma effects",
    title: "layer blur vs background blur",
    goal: "레이어 전체 흐림과 뒤 배경만 흐림의 차이를 SVG/CSS 관점에서 본다.",
    demo: "filter-blur-types",
    takeaways: [
      "LAYER_BLUR → SourceGraphic blur.",
      "BACKGROUND_BLUR → BackgroundImage.",
      "CSS backdrop-filter 대응."
    ]
  },
  {
    id: "039",
    part: "Part 9. SVG filter & Figma effects",
    title: "Figma effect 매핑표 전체",
    goal: "figmaEffectToSvgFilter로 네 가지 effect type을 한 API에서 dispatch한다.",
    demo: "figma-effects-all",
    takeaways: [
      "FIGMA_EFFECT_FILTER_MAP.",
      "figmaEffectToSvgFilter.",
      "플러그인 export 파이프라인 입구."
    ]
  },
  {
    id: "040",
    part: "Part 10. Figma ↔ SVG bridge",
    title: "vector network vs path d",
    goal: "Figma vectorNetwork(vertices+segments)와 SVG path d가 같은 geometry의 두 표현임을 변환한다.",
    demo: "figma-vector-network",
    takeaways: [
      "figmaNetworkToPathD / pathDToFigmaNetwork.",
      "편집기는 network, export는 d.",
      "Part 6 path editor와 연결."
    ]
  },
  {
    id: "041",
    part: "Part 10. Figma ↔ SVG bridge",
    title: "fill · stroke export",
    goal: "Figma SOLID/GRADIENT_LINEAR paint와 stroke 속성을 SVG attribute로 매핑한다.",
    demo: "figma-fill-stroke",
    takeaways: [
      "figmaSolidPaintToSvg, figmaLinearGradientPaintToSvg.",
      "figmaStrokeToSvgAttributes.",
      "strokeAlign은 SVG 추가 작업."
    ]
  },
  {
    id: "042",
    part: "Part 10. Figma ↔ SVG bridge",
    title: "boolean operations export",
    goal: "Figma UNION/SUBTRACT 등이 compound path와 fill-rule로 export되는 방식을 본다.",
    demo: "figma-boolean",
    takeaways: [
      "FIGMA_BOOLEAN_MAP.",
      "figmaBooleanPathsToSvg.",
      "Part 7 boolean과 연결."
    ]
  },
  {
    id: "043",
    part: "Part 10. Figma ↔ SVG bridge",
    title: "mask · clip export",
    goal: "Figma mask group을 clipPath와 mask로 변환하는 markup을 생성한다.",
    demo: "figma-clip-mask",
    takeaways: [
      "figmaClipToSvgMarkup.",
      "figmaMaskToSvgMarkup.",
      "020강 clip/mask 개념의 export 버전."
    ]
  },
  {
    id: "044",
    part: "Part 11. Icon design",
    title: "pixel grid · optical alignment",
    goal: "24×24 그리드와 half-pixel snap으로 흐릿하지 않은 아이콘 좌표를 만든다.",
    demo: "icon-grid",
    takeaways: [
      "snapPointToIconGrid, snapPathDToIconGrid.",
      "stroke 1 / 1.5 / 2 가 crisp.",
      "viewBox 0 0 24 24 관례."
    ]
  },
  {
    id: "045",
    part: "Part 11. Icon design",
    title: "fill vs stroke icons",
    goal: "같은 형태를 fill solid와 stroke outline 두 스타일로 설계할 때 차이를 본다.",
    demo: "icon-fill-stroke",
    takeaways: [
      "fill icon = closed path.",
      "stroke icon = centerline + stroke-width.",
      "Figma stroke align 이슈 재등장."
    ]
  },
  {
    id: "046",
    part: "Part 11. Icon design",
    title: "symbol · sprite · currentColor",
    goal: "symbol/use 스프라이트와 currentColor로 CSS tint 가능한 아이콘을 만든다.",
    demo: "icon-sprite",
    takeaways: [
      "buildSvgSymbol, buildSvgUse, buildSvgSpriteSheet.",
      "currentColorAttributes.",
      "svgMarkupToDataUri."
    ]
  },
  {
    id: "047",
    part: "Part 11. Icon design",
    title: "path simplification",
    goal: "Douglas–Peucker로 export path 포인트 수를 줄인다.",
    demo: "icon-simplify",
    takeaways: [
      "simplifyPathD, douglasPeucker.",
      "SVGO와 같은 계열.",
      "곡선은 먼저 flatten."
    ]
  },
  {
    id: "048",
    part: "Appendix A. SVG in CSS",
    title: "currentColor 아이콘",
    goal: "SVG fill/stroke에 currentColor를 써 CSS color로 아이콘 색을 바꾼다.",
    demo: "svg-current-color",
    takeaways: [
      "currentColorAttributes.",
      "inline SVG vs mask.",
      "css-matrix color 강의와 연결."
    ]
  },
  {
    id: "049",
    part: "Appendix A. SVG in CSS",
    title: "sprite · data URI",
    goal: "symbol 스프라이트 시트와 data URI로 아이콘을 배포한다.",
    demo: "svg-sprite-uri",
    takeaways: [
      "buildSvgSpriteSheet.",
      "svgMarkupToDataUri.",
      "background-image: url(data:...)."
    ]
  },
  {
    id: "050",
    part: "Appendix A. SVG in CSS",
    title: "viewBox · export 최적화",
    goal: "viewBox 정리와 path simplify로 SVG 파일 크기를 줄인다.",
    demo: "svg-optimize",
    takeaways: [
      "optimizeSvgViewBox.",
      "simplifyPathD.",
      "SVGO는 빌드 파이프라인."
    ]
  },
  {
    id: "051",
    part: "Appendix B. Engine extras",
    title: "stroke-dasharray · offset path",
    goal: "dash 패턴 phase와 flatten 기반 offset path를 계산한다.",
    demo: "engine-dash-offset",
    takeaways: [
      "parseDashArray, dashPatternPhaseAtLength.",
      "strokeDashIntervals, sampleStrokeDash.",
      "offsetPolyline, offsetPathD."
    ]
  },
  {
    id: "052",
    part: "Appendix B. Engine extras",
    title: "adaptive flatten",
    goal: "허용 오차 기반으로 곡선 flatten 포인트 수를 줄인다.",
    demo: "engine-adaptive-flatten",
    takeaways: [
      "flattenPathSegmentsAdaptive.",
      "flattenCubicAdaptive.",
      "compareFlattenMethods."
    ]
  },
  {
    id: "053",
    part: "Appendix B. Engine extras",
    title: "arc → cubic 변환",
    goal: "SVG arc(A)를 정확한 cubic Bézier 세그먼트로 변환한다.",
    demo: "engine-arc-cubic",
    takeaways: [
      "svgArcCenterParameters.",
      "arcSegmentToCubics.",
      "convertArcsInPathD."
    ]
  },
  {
    id: "054",
    part: "Appendix B. Engine extras",
    title: "multi-subpath handle editing",
    goal: "compound path에서 subpath별로 핸들을 독립 편집한다.",
    demo: "engine-multi-subpath",
    takeaways: [
      "listSubpathHandles.",
      "updateSubpathHandle.",
      "segmentsToSubpaths."
    ]
  },
  {
    id: "055",
    part: "Part 12. Foundations primer",
    title: "SVG 한 장 지도",
    goal: "svg-matrix·css-matrix·webgl 시리즈에서 SVG가 담당하는 범위를 한눈에 본다.",
    demo: "primer-capability-map",
    takeaways: [
      "SVG_CAPABILITY_MAP.",
      "FIGMA_SVG_LAYERS.",
      "pathPaintModel."
    ]
  },
  {
    id: "056",
    part: "Part 12. Foundations primer",
    title: "좌표 스택 — pointer → user space",
    goal: "viewport pixel과 viewBox user space 변환을 단계별로 추적한다.",
    demo: "primer-coordinate-stack",
    takeaways: [
      "explainCoordinateStack.",
      "001–002 강의와 연결.",
      "편집기 hit test는 항상 space를 명시."
    ]
  },
  {
    id: "057",
    part: "Part 13. Figma ↔ SVG (deep)",
    title: "Figma paint types & gap map",
    goal: "Figma fill 타입별 SVG 지원 여부와 우회 방법을 표로 정리한다.",
    demo: "figma-paint-gap",
    takeaways: [
      "FIGMA_PAINT_GAP_MAP.",
      "figmaPaintToSvg.",
      "angular → CSS conic."
    ]
  },
  {
    id: "058",
    part: "Part 13. Figma ↔ SVG (deep)",
    title: "radial · angular gradient export",
    goal: "Figma radial을 radialGradient로, angular를 CSS conic으로 export한다.",
    demo: "figma-radial-paint",
    takeaways: [
      "figmaRadialGradientPaintToSvg.",
      "figmaAngularGradientToCss.",
      "gradientHandlePositions."
    ]
  },
  {
    id: "059",
    part: "Part 13. Figma ↔ SVG (deep)",
    title: "image · pattern fill",
    goal: "Figma image fill을 SVG pattern/image로 매핑한다.",
    demo: "figma-image-paint",
    takeaways: [
      "figmaImagePaintToSvg.",
      "TILE vs FILL scaleMode.",
      "href / imageRef."
    ]
  },
  {
    id: "060",
    part: "Part 13. Figma ↔ SVG (deep)",
    title: "stroke align export",
    goal: "Figma INSIDE stroke를 clipPath + 2× stroke-width로 재현한다.",
    demo: "figma-stroke-align-export",
    takeaways: [
      "figmaStrokeAlignToSvgMarkup.",
      "CENTER vs INSIDE vs OUTSIDE.",
      "006 강의와 연결."
    ]
  },
  {
    id: "061",
    part: "Part 13. Figma ↔ SVG (deep)",
    title: "blend mode · layer opacity",
    goal: "Figma blendMode와 opacity를 SVG/CSS compositing으로 옮긴다.",
    demo: "figma-blend-opacity",
    takeaways: [
      "FIGMA_BLEND_MAP.",
      "figmaBlendModeToSvg.",
      "figmaLayerCompositingToSvg."
    ]
  },
  {
    id: "062",
    part: "Part 14. SVG spec breadth",
    title: "markers — 화살표와 dash 끝",
    goal: "marker-start/end로 선 끝 장식을 붙인다.",
    demo: "svg-markers",
    takeaways: [
      "buildMarkerMarkup.",
      "orient=auto.",
      "051 dash와 짝."
    ]
  },
  {
    id: "063",
    part: "Part 14. SVG spec breadth",
    title: "text · textPath",
    goal: "path를 따라가는 텍스트와 라벨 SVG를 만든다.",
    demo: "svg-text-path",
    takeaways: [
      "buildTextPathMarkup.",
      "defs path + textPath.",
      "Figma text는 보통 outline."
    ]
  },
  {
    id: "064",
    part: "Part 14. SVG spec breadth",
    title: "paint-order · opacity · filters",
    goal: "paint-order, layer opacity, feTurbulence 소개로 스펙 폭을 넓힌다.",
    demo: "svg-paint-order",
    takeaways: [
      "paintOrderAttributes.",
      "layerOpacityAttributes.",
      "buildTurbulenceFilterMarkup."
    ]
  },
  {
    id: "065",
    part: "Part 14. SVG spec breadth",
    title: "arc flatten 통합",
    goal: "chord 보간 vs 정확 arc→cubic flatten 차이를 본다.",
    demo: "arc-flatten-unified",
    takeaways: [
      "flattenPathSegments가 arc.js 사용.",
      "053 convertArcsInPathD.",
      "export 파이프라인 일관성."
    ]
  }
];

export function getLesson(id) {
  const normalized = String(id).padStart(3, "0");
  const lesson = LESSONS.find((item) => item.id === normalized);
  if (!lesson) throw new Error(`Unknown lesson: ${id}`);
  return lesson;
}

export function lessonsByPart() {
  return LESSONS.reduce((groups, lesson) => {
    const group = groups.find((item) => item.part === lesson.part);
    if (group) group.lessons.push(lesson);
    else groups.push({ part: lesson.part, lessons: [lesson] });
    return groups;
  }, []);
}
