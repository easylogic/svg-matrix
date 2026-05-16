import {
  bboxOfPath,
  applySpreadMethod,
  arcSegmentToCubics,
  buildPatternMarkup,
  compareFlattenMethods,
  convertArcsInPathD,
  flattenPathSegmentsAdaptive,
  formatDashArray,
  hitTestSubpathHandles,
  listSubpathHandles,
  offsetPathD,
  parseDashArray,
  strokeDashIntervals,
  updateSubpathHandle,
  classifyPointInPath,
  colorToCss,
  cubicBezierPoint,
  distancePointToSegment,
  buildDropShadowFilterChain,
  figmaDropShadowToSvgFilter,
  figmaEffectToSvgFilter,
  figmaInnerShadowToSvgFilter,
  figmaLayerBlurToSvgFilter,
  FIGMA_BLEND_MAP,
  FIGMA_BOOLEAN_MAP,
  FIGMA_EFFECT_FILTER_MAP,
  FIGMA_PAINT_GAP_MAP,
  FIGMA_SVG_LAYERS,
  FIGMA_VECTOR_MODEL,
  SVG_CAPABILITY_MAP,
  buildMarkerMarkup,
  buildTextPathMarkup,
  buildTurbulenceFilterMarkup,
  explainCoordinateStack,
  figmaAngularGradientToCss,
  figmaBlendModeToSvg,
  figmaImagePaintToSvg,
  figmaLayerCompositingToSvg,
  figmaPaintToSvg,
  figmaRadialGradientPaintToSvg,
  figmaStrokeAlignToSvgMarkup,
  layerOpacityAttributes,
  paintOrderAttributes,
  pathPaintModel,
  figmaBooleanPathsToSvg,
  figmaClipToSvgMarkup,
  figmaLinearGradientPaintToSvg,
  figmaMaskToSvgMarkup,
  figmaNetworkToPathD,
  figmaSolidPaintToSvg,
  figmaStrokeToSvgAttributes,
  buildSvgSpriteSheet,
  buildSvgSymbol,
  buildSvgUse,
  currentColorAttributes,
  nearestCrispStrokeWidth,
  optimizeSvgViewBox,
  pathDToFigmaNetwork,
  simplifyPathD,
  snapPathDToIconGrid,
  svgMarkupToDataUri,
  hitTestPathHandles,
  flattenPathSegments,
  linearGradientStopParameter,
  miterLength,
  objectBoundingBoxToUserSpace,
  parsePathD,
  pathFromD,
  parsePathMoveLine,
  parseViewBox,
  patternTileCoordinates,
  pathDFromSegments,
  pathLength,
  pathSegmentsToD,
  pointAtPathLength,
  pointInPath,
  pointInPathBoolean,
  sampleLinearGradient,
  sampleRadialGradient,
  shouldBevelJoin,
  viewBoxToViewport,
  windingNumber
} from "../svg-matrix-core/src/index.js";
import { getLesson } from "./lesson-data.js";
import { createCompoundPathEditor, createPathEditor } from "./path-editor.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function range(label, min, max, value, step = 1) {
  const wrapper = el("label");
  const caption = el("span", "", label);
  const input = document.createElement("input");
  const output = el("span", "", String(value));
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);
  input.step = String(step);
  input.addEventListener("input", () => {
    output.textContent = input.value;
  });
  wrapper.append(caption, input, output);
  return { wrapper, input, output };
}

function svgNs() {
  return "http://www.w3.org/2000/svg";
}

function svgPoint(svg, event) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  return {
    x: viewBox.x + ((event.clientX - rect.left) / rect.width) * viewBox.width,
    y: viewBox.y + ((event.clientY - rect.top) / rect.height) * viewBox.height
  };
}

function mountViewBoxDemo(canvas, toolbar, readout) {
  const vbMinX = range("viewBox minX", -50, 50, 0);
  const vbMinY = range("viewBox minY", -50, 50, 0);
  const vbW = range("viewBox width", 50, 300, 160);
  const vbH = range("viewBox height", 50, 300, 100);
  toolbar.append(vbMinX.wrapper, vbMinY.wrapper, vbW.wrapper, vbH.wrapper);

  const svg = document.createElementNS(svgNs(), "svg");
  canvas.append(svg);

  function render() {
    const viewBox = {
      x: Number(vbMinX.input.value),
      y: Number(vbMinY.input.value),
      width: Number(vbW.input.value),
      height: Number(vbH.input.value)
    };
    const viewport = { width: canvas.clientWidth || 640, height: canvas.clientHeight || 420 };
    const mapped = viewBoxToViewport(viewBox, viewport.width, viewport.height);
    svg.setAttribute("viewBox", `0 0 ${viewport.width} ${viewport.height}`);

    svg.replaceChildren();
    const content = document.createElementNS(svgNs(), "g");
    content.setAttribute("transform", `translate(${mapped.translateX} ${mapped.translateY}) scale(${mapped.scale})`);

    const frame = document.createElementNS(svgNs(), "rect");
    frame.setAttribute("x", String(viewBox.x));
    frame.setAttribute("y", String(viewBox.y));
    frame.setAttribute("width", String(viewBox.width));
    frame.setAttribute("height", String(viewBox.height));
    frame.setAttribute("fill", "rgba(37, 99, 235, 0.12)");
    frame.setAttribute("stroke", "#2563eb");
    frame.setAttribute("stroke-width", "2");

    const tri = document.createElementNS(svgNs(), "polygon");
    tri.setAttribute("points", "20,80 80,20 140,90");
    tri.setAttribute("fill", "#f59e0b");
    tri.setAttribute("stroke", "#92400e");
    tri.setAttribute("stroke-width", "3");

    content.append(frame, tri);
    svg.append(content);

    readout.textContent = `viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}"
viewport=${viewport.width} x ${viewport.height}
scale=${mapped.scale.toFixed(3)}
translate=(${mapped.translateX.toFixed(1)}, ${mapped.translateY.toFixed(1)})
content size on screen=${mapped.contentWidth.toFixed(1)} x ${mapped.contentHeight.toFixed(1)}`;
  }

  [vbMinX.input, vbMinY.input, vbW.input, vbH.input].forEach((input) => input.addEventListener("input", render));
  render();
}

function mountSvgTransformDemo(canvas, toolbar, readout) {
  const tx = range("translateX", -120, 120, 40);
  const ty = range("translateY", -120, 120, 20);
  const rot = range("rotate", -180, 180, 20);
  const sx = range("scaleX", 0.4, 2, 1);
  toolbar.append(tx.wrapper, ty.wrapper, rot.wrapper, sx.wrapper);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);

  const world = document.createElementNS(svgNs(), "rect");
  world.setAttribute("x", "40");
  world.setAttribute("y", "40");
  world.setAttribute("width", "560");
  world.setAttribute("height", "340");
  world.setAttribute("fill", "none");
  world.setAttribute("stroke", "#94a3b8");
  world.setAttribute("stroke-dasharray", "6 6");

  const group = document.createElementNS(svgNs(), "g");
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", "220");
  shape.setAttribute("y", "120");
  shape.setAttribute("width", "140");
  shape.setAttribute("height", "90");
  shape.setAttribute("rx", "12");
  shape.setAttribute("fill", "#2563eb");
  group.append(shape);
  svg.append(world, group);

  function render() {
    const tX = Number(tx.input.value);
    const tY = Number(ty.input.value);
    const angle = Number(rot.input.value);
    const scale = Number(sx.input.value);
    const cx = 290;
    const cy = 165;
    group.setAttribute("transform", `translate(${tX} ${tY}) rotate(${angle} ${cx} ${cy}) scale(${scale})`);
    readout.textContent = `local shape rect at (220,120)
group transform="translate(${tX} ${tY}) rotate(${angle} ${cx} ${cy}) scale(${scale})"
screen position uses matrix multiplication on every point`;
  }

  [tx.input, ty.input, rot.input, sx.input].forEach((input) => input.addEventListener("input", render));
  render();
}

function mountPathGrammarDemo(canvas, toolbar, readout) {
  const samples = [
    "M 40 80 L 180 40 L 260 140 Z",
    "M 80 220 L 220 220 L 220 320 L 80 320 Z",
    "M 320 80 L 520 80 L 420 200 Z"
  ];
  let index = 0;
  const next = el("button", "", "Next path");
  next.type = "button";
  toolbar.append(next);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);

  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("fill", "rgba(37, 99, 235, 0.2)");
  path.setAttribute("stroke", "#1d4ed8");
  path.setAttribute("stroke-width", "3");
  svg.append(path);

  function render() {
    const d = samples[index];
    const segments = parsePathMoveLine(d);
    path.setAttribute("d", d);
    readout.textContent = `d="${d}"

parsed segments:
${segments
  .map((segment, i) => {
    if (segment.type === "M") return `${i}. M ${segment.point.x}, ${segment.point.y}`;
    return `${i}. L ${segment.from.x},${segment.from.y} -> ${segment.to.x},${segment.to.y}`;
  })
  .join("\n")}

rebuilt d="${pathSegmentsToD(segments)}"`;
  }

  next.addEventListener("click", () => {
    index = (index + 1) % samples.length;
    render();
  });
  render();
}

function mountStrokeHitDemo(canvas, toolbar, readout) {
  const strokeWidth = range("strokeWidth", 2, 40, 16);
  const hitWidth = range("hit helper", 4, 48, 24);
  toolbar.append(strokeWidth.wrapper, hitWidth.wrapper);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);

  const visible = document.createElementNS(svgNs(), "path");
  visible.setAttribute("d", "M 60 300 C 160 80, 480 340, 580 120");
  visible.setAttribute("fill", "none");
  visible.setAttribute("stroke", "#0f172a");
  visible.setAttribute("stroke-linecap", "round");

  const hit = document.createElementNS(svgNs(), "path");
  hit.setAttribute("d", visible.getAttribute("d"));
  hit.setAttribute("fill", "none");
  hit.setAttribute("stroke", "transparent");
  hit.style.pointerEvents = "stroke";

  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "6");
  marker.setAttribute("fill", "#ef4444");

  svg.append(visible, hit, marker);

  function render() {
    const sw = Number(strokeWidth.input.value);
    const hw = Number(hitWidth.input.value);
    visible.setAttribute("stroke-width", String(sw));
    hit.setAttribute("stroke-width", String(hw));
    readout.textContent = `visible stroke-width=${sw}
helper hit stroke-width=${hw}
hit test rule: distance(point, path) <= hitWidth / 2`;
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = svg.getBoundingClientRect();
    const point = {
      x: ((event.clientX - rect.left) / rect.width) * 640,
      y: ((event.clientY - rect.top) / rect.height) * 420
    };
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    const segments = parsePathMoveLine("M 60 300 L 160 80 L 480 340 L 580 120");
    const distances = segments
      .filter((segment) => segment.type === "L")
      .map((segment) => distancePointToSegment(point, segment.from, segment.to));
    const minDistance = Math.min(...distances);
    const hitOk = minDistance <= Number(hitWidth.input.value) / 2;
    marker.setAttribute("fill", hitOk ? "#22c55e" : "#ef4444");
    readout.textContent = `pointer=(${point.x.toFixed(1)}, ${point.y.toFixed(1)})
min distance to polyline=${minDistance.toFixed(2)}
hit threshold=${(Number(hitWidth.input.value) / 2).toFixed(2)}
${hitOk ? "HIT" : "miss"}`;
  });

  [strokeWidth.input, hitWidth.input].forEach((input) => input.addEventListener("input", render));
  render();
}

function mountStrokeStyleDemo(canvas, toolbar, readout) {
  const join = document.createElement("select");
  ["miter", "round", "bevel"].forEach((value) => join.append(new Option(value, value)));
  const cap = document.createElement("select");
  ["butt", "round", "square"].forEach((value) => cap.append(new Option(value, value)));
  const miter = range("miterlimit", 1, 20, 4);
  toolbar.append(el("label", "", "join"), join, el("label", "", "cap"), cap, miter.wrapper);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);

  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", "M 80 300 L 220 120 L 360 300");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#2563eb");
  path.setAttribute("stroke-width", "18");
  svg.append(path);

  function render() {
    path.setAttribute("stroke-linejoin", join.value);
    path.setAttribute("stroke-linecap", cap.value);
    path.setAttribute("stroke-miterlimit", miter.input.value);
    readout.textContent = `stroke-linejoin=${join.value}
stroke-linecap=${cap.value}
stroke-miterlimit=${miter.input.value}
acute corner + high miter limit => long miter spike`;
  }

  [join, cap, miter.input].forEach((control) => control.addEventListener("input", render));
  render();
}

function mountStrokeAlignDemo(canvas, toolbar, readout) {
  const align = document.createElement("select");
  ["center", "inside", "outside"].forEach((value) => align.append(new Option(value, value)));
  toolbar.append(el("label", "", "conceptual align"), align);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);

  const base = document.createElementNS(svgNs(), "path");
  base.setAttribute("d", "M 120 120 L 320 120 L 320 280 L 120 280 Z");
  base.setAttribute("fill", "rgba(37, 99, 235, 0.15)");
  base.setAttribute("stroke", "#64748b");
  base.setAttribute("stroke-width", "2");

  const center = document.createElementNS(svgNs(), "path");
  center.setAttribute("d", base.getAttribute("d"));
  center.setAttribute("fill", "none");
  center.setAttribute("stroke", "#2563eb");
  center.setAttribute("stroke-width", "16");

  const outline = document.createElementNS(svgNs(), "path");
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "#f59e0b");
  outline.setAttribute("stroke-width", "16");

  svg.append(base, center, outline);

  function render() {
    center.style.display = align.value === "center" ? "block" : "none";
    outline.style.display = align.value === "center" ? "none" : "block";
    readout.textContent =
      align.value === "center"
        ? `SVG native stroke is centered on the path.
stroke is drawn half inside, half outside the fill boundary.`
        : `Figma inside/outside stroke is not a single SVG attribute.
Typical approach: offset the path (outline) then stroke the offset curve.
align=${align.value} needs geometry expansion or clipping.`;
  }

  align.addEventListener("change", render);
  render();
}

function mountPathCommandDemo(canvas, toolbar, readout, d, label) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("fill", "rgba(37, 99, 235, 0.15)");
  path.setAttribute("stroke", "#1d4ed8");
  path.setAttribute("stroke-width", "3");
  svg.append(path);

  function render() {
    const segments = parsePathD(d);
    path.setAttribute("d", d);
    readout.textContent = `${label}
d="${d}"

segments (${segments.length}):
${segments
  .map((segment, i) => {
    if (segment.type === "M") return `${i}. M (${segment.point.x}, ${segment.point.y})`;
    if (segment.type === "L") return `${i}. L (${segment.from.x},${segment.from.y}) -> (${segment.to.x},${segment.to.y})`;
    if (segment.type === "C") {
      return `${i}. C cp1=(${segment.cp1.x},${segment.cp1.y}) cp2=(${segment.cp2.x},${segment.cp2.y}) to=(${segment.to.x},${segment.to.y})`;
    }
    if (segment.type === "Q") return `${i}. Q cp=(${segment.cp.x},${segment.cp.y}) to=(${segment.to.x},${segment.to.y})`;
    if (segment.type === "A") {
      return `${i}. A rx=${segment.rx} ry=${segment.ry} rot=${segment.rotation} large=${segment.largeArc} sweep=${segment.sweep} to=(${segment.to.x},${segment.to.y})`;
    }
    return `${i}. ?`;
  })
  .join("\n")}

rebuilt="${pathDFromSegments(segments)}"`;
  }
  render();
}

function mountPathCubicDemo(canvas, toolbar, readout) {
  const steps = range("flatten steps", 4, 40, 16);
  toolbar.append(steps.wrapper);
  const d = "M 60 300 C 120 60, 520 360, 580 120";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const curve = document.createElementNS(svgNs(), "path");
  curve.setAttribute("d", d);
  curve.setAttribute("fill", "none");
  curve.setAttribute("stroke", "#94a3b8");
  curve.setAttribute("stroke-width", "2");
  curve.setAttribute("stroke-dasharray", "6 6");
  const poly = document.createElementNS(svgNs(), "polyline");
  poly.setAttribute("fill", "none");
  poly.setAttribute("stroke", "#2563eb");
  poly.setAttribute("stroke-width", "3");
  svg.append(curve, poly);

  function render() {
    const segments = parsePathD(d);
    const flat = flattenPathSegments(segments, { stepsPerCurve: Number(steps.input.value) });
    poly.setAttribute("points", flat.map((p) => `${p.x},${p.y}`).join(" "));
    const c = segments.find((s) => s.type === "C");
    readout.textContent = `cubic segment + ${flat.length} sampled points
B(1)=(${cubicBezierPoint(c.from, c.cp1, c.cp2, c.to, 1).x.toFixed(1)}, ${cubicBezierPoint(c.from, c.cp1, c.cp2, c.to, 1).y.toFixed(1)})
control handles at cp1/cp2 drive curvature`;
  }
  steps.input.addEventListener("input", render);
  render();
}

function mountPathFlattenDemo(canvas, toolbar, readout) {
  const steps = range("stepsPerCurve", 2, 48, 12);
  toolbar.append(steps.wrapper);
  const d = "M 80 320 Q 200 40 360 320 T 560 120";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#cbd5e1");
  path.setAttribute("stroke-width", "2");
  const dots = document.createElementNS(svgNs(), "g");
  svg.append(path, dots);

  function render() {
    const segments = parsePathD(d);
    const flat = flattenPathSegments(segments, { stepsPerCurve: Number(steps.input.value) });
    dots.replaceChildren(
      ...flat.map((point) => {
        const dot = document.createElementNS(svgNs(), "circle");
        dot.setAttribute("cx", String(point.x));
        dot.setAttribute("cy", String(point.y));
        dot.setAttribute("r", "3");
        dot.setAttribute("fill", "#2563eb");
        return dot;
      })
    );
    readout.textContent = `flatten stepsPerCurve=${steps.input.value}
${flat.length} points — more steps => better stroke/fill/bbox accuracy`;
  }
  steps.input.addEventListener("input", render);
  render();
}

function mountPathBboxDemo(canvas, toolbar, readout) {
  const d = "M 120 300 C 200 40, 440 360, 520 80";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "rgba(37, 99, 235, 0.12)");
  path.setAttribute("stroke", "#1d4ed8");
  path.setAttribute("stroke-width", "3");
  const box = document.createElementNS(svgNs(), "rect");
  box.setAttribute("fill", "none");
  box.setAttribute("stroke", "#f59e0b");
  box.setAttribute("stroke-width", "2");
  box.setAttribute("stroke-dasharray", "8 4");
  svg.append(path, box);

  const bbox = bboxOfPath(parsePathD(d), { stepsPerCurve: 24 });
  box.setAttribute("x", String(bbox.x));
  box.setAttribute("y", String(bbox.y));
  box.setAttribute("width", String(bbox.width));
  box.setAttribute("height", String(bbox.height));
  readout.textContent = `bboxOfPath (sampled)
x=${bbox.x.toFixed(1)} y=${bbox.y.toFixed(1)}
width=${bbox.width.toFixed(1)} height=${bbox.height.toFixed(1)}`;
}

function mountMiterMathDemo(canvas, toolbar, readout) {
  const angle = range("join angle (deg)", 20, 160, 60);
  const sw = range("strokeWidth", 4, 32, 16);
  const limit = range("miterLimit", 1, 12, 4);
  toolbar.append(angle.wrapper, sw.wrapper, limit.wrapper);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", "M 120 300 L 320 120 L 520 300");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#2563eb");
  svg.append(path);

  function render() {
    const joinRad = (Number(angle.input.value) * Math.PI) / 180;
    const strokeWidth = Number(sw.input.value);
    const miterLimit = Number(limit.input.value);
    const miter = miterLength(Math.PI - joinRad, strokeWidth);
    const bevel = shouldBevelJoin(Math.PI - joinRad, strokeWidth, miterLimit);
    path.setAttribute("stroke-width", String(strokeWidth));
    path.setAttribute("stroke-miterlimit", String(miterLimit));
    path.setAttribute("stroke-linejoin", bevel ? "bevel" : "miter");
    readout.textContent = `join angle=${angle.input.value}°
miter length=${Number.isFinite(miter) ? miter.toFixed(2) : "∞"}
threshold strokeWidth*miterLimit=${(strokeWidth * miterLimit).toFixed(2)}
${bevel ? "BEvel (spike too long)" : "miter OK"}`;
  }
  [angle.input, sw.input, limit.input].forEach((input) => input.addEventListener("input", render));
  render();
}

function mountFillRuleDemo(canvas, toolbar, readout) {
  const rule = document.createElement("select");
  ["nonzero", "evenodd"].forEach((value) => rule.append(new Option(value, value)));
  toolbar.append(el("label", "", "fill-rule"), rule);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", "M 160 80 L 480 80 L 480 340 L 160 340 Z M 240 140 L 400 140 L 400 280 L 240 280 Z");
  path.setAttribute("stroke", "#1e293b");
  path.setAttribute("stroke-width", "2");
  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "7");
  svg.append(path, marker);

  function render() {
    path.setAttribute("fill-rule", rule.value);
    readout.textContent = `fill-rule=${rule.value}
move pointer — winding=${windingNumber(
      { x: Number(marker.getAttribute("cx")), y: Number(marker.getAttribute("cy")) },
      flattenPathSegments(parsePathD(path.getAttribute("d")), { stepsPerCurve: 1 })
    )}`;
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = svg.getBoundingClientRect();
    const point = {
      x: ((event.clientX - rect.left) / rect.width) * 640,
      y: ((event.clientY - rect.top) / rect.height) * 420
    };
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    const inside = pointInPath(point, parsePathD(path.getAttribute("d")), rule.value, { stepsPerCurve: 16 });
    path.setAttribute("fill", inside ? "rgba(34, 197, 94, 0.35)" : "rgba(239, 68, 68, 0.2)");
    render();
  });
  rule.addEventListener("change", render);
  render();
}

function mountFillHitDemo(canvas, toolbar, readout) {
  mountFillRuleDemo(canvas, toolbar, readout);
  readout.textContent = `${readout.textContent}\n\nfill hit = pointInPath(flattened polygon)`;
}

function mountPathLengthDemo(canvas, toolbar, readout) {
  const t = range("distance along path", 0, 500, 120);
  toolbar.append(t.wrapper);
  const d = "M 60 300 C 160 80, 480 340, 580 120";
  const segments = parsePathD(d);
  const total = pathLength(segments, { stepsPerCurve: 24 });
  t.input.max = String(Math.ceil(total));

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#0f172a");
  path.setAttribute("stroke-width", "4");
  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "8");
  marker.setAttribute("fill", "#f59e0b");
  svg.append(path, marker);

  function render() {
    const sample = pointAtPathLength(segments, Number(t.input.value), { stepsPerCurve: 24 });
    marker.setAttribute("cx", String(sample.point.x));
    marker.setAttribute("cy", String(sample.point.y));
    readout.textContent = `path length=${total.toFixed(2)}
distance=${t.input.value}
point=(${sample.point.x.toFixed(1)}, ${sample.point.y.toFixed(1)})
tangent=(${sample.tangent.x.toFixed(3)}, ${sample.tangent.y.toFixed(3)})`;
  }
  t.input.addEventListener("input", render);
  render();
}

function mountGradientUnitsDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const rect = document.createElementNS(svgNs(), "rect");
  rect.setAttribute("x", "160");
  rect.setAttribute("y", "100");
  rect.setAttribute("width", "320");
  rect.setAttribute("height", "200");
  rect.setAttribute("fill", "url(#grad)");
  const defs = document.createElementNS(svgNs(), "defs");
  const grad = document.createElementNS(svgNs(), "linearGradient");
  grad.setAttribute("id", "grad");
  grad.setAttribute("gradientUnits", "userSpaceOnUse");
  grad.setAttribute("x1", "160");
  grad.setAttribute("y1", "100");
  grad.setAttribute("x2", "480");
  grad.setAttribute("y2", "100");
  ["#2563eb", "#22c55e", "#f59e0b"].forEach((color, i) => {
    const stop = document.createElementNS(svgNs(), "stop");
    stop.setAttribute("offset", String(i / 2));
    stop.setAttribute("stop-color", color);
    grad.append(stop);
  });
  defs.append(grad);
  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "7");
  marker.setAttribute("fill", "#ef4444");
  svg.append(defs, rect, marker);

  const start = { x: 160, y: 100 };
  const end = { x: 480, y: 100 };
  const bbox = { x: 160, y: 100, width: 320, height: 200 };

  canvas.addEventListener("pointermove", (event) => {
    const pt = {
      x: ((event.clientX - canvas.getBoundingClientRect().left) / canvas.clientWidth) * 640,
      y: ((event.clientY - canvas.getBoundingClientRect().top) / canvas.clientHeight) * 420
    };
    marker.setAttribute("cx", String(pt.x));
    marker.setAttribute("cy", String(pt.y));
    const tUser = linearGradientStopParameter(pt, start, end);
    const normalized = {
      x: (pt.x - bbox.x) / bbox.width,
      y: (pt.y - bbox.y) / bbox.height
    };
    const fromBox = objectBoundingBoxToUserSpace(normalized, bbox);
    readout.textContent = `userSpace t=${tUser.toFixed(3)} (project onto gradient axis)
objectBoundingBox (0-1)=(${normalized.x.toFixed(3)}, ${normalized.y.toFixed(3)})
mapped to userSpace=(${fromBox.x.toFixed(1)}, ${fromBox.y.toFixed(1)})`;
  });
}

function mountClipMaskDemo(canvas, toolbar, readout) {
  const mode = document.createElement("select");
  ["none", "clip", "opacity-mask"].forEach((value) => mode.append(new Option(value, value)));
  toolbar.append(el("label", "", "mode"), mode);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const clip = document.createElementNS(svgNs(), "clipPath");
  clip.setAttribute("id", "clip-circle");
  const clipShape = document.createElementNS(svgNs(), "circle");
  clipShape.setAttribute("cx", "320");
  clipShape.setAttribute("cy", "210");
  clipShape.setAttribute("r", "120");
  clip.append(clipShape);
  const mask = document.createElementNS(svgNs(), "mask");
  mask.setAttribute("id", "fade-mask");
  const maskRect = document.createElementNS(svgNs(), "rect");
  maskRect.setAttribute("x", "120");
  maskRect.setAttribute("y", "80");
  maskRect.setAttribute("width", "400");
  maskRect.setAttribute("height", "260");
  maskRect.setAttribute("fill", "url(#fade)");
  const fade = document.createElementNS(svgNs(), "linearGradient");
  fade.setAttribute("id", "fade");
  fade.setAttribute("x1", "0");
  fade.setAttribute("x2", "1");
  [["0", "#fff"], ["1", "transparent"]].forEach(([offset, color]) => {
    const stop = document.createElementNS(svgNs(), "stop");
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    fade.append(stop);
  });
  defs.append(clip, mask, fade);
  mask.append(maskRect);

  const content = document.createElementNS(svgNs(), "g");
  const bg = document.createElementNS(svgNs(), "rect");
  bg.setAttribute("x", "80");
  bg.setAttribute("y", "60");
  bg.setAttribute("width", "480");
  bg.setAttribute("height", "300");
  bg.setAttribute("fill", "#2563eb");
  const fg = document.createElementNS(svgNs(), "text");
  fg.setAttribute("x", "200");
  fg.setAttribute("y", "230");
  fg.setAttribute("fill", "#f8fafc");
  fg.setAttribute("font-size", "36");
  fg.textContent = "SVG layer stack";
  content.append(bg, fg);
  svg.append(defs, content);

  function render() {
    content.removeAttribute("clip-path");
    content.removeAttribute("mask");
    if (mode.value === "clip") content.setAttribute("clip-path", "url(#clip-circle)");
    if (mode.value === "opacity-mask") content.setAttribute("mask", "url(#fade-mask)");
    readout.textContent =
      mode.value === "none"
        ? "No clip/mask — full rectangle visible."
        : mode.value === "clip"
          ? "clipPath: hard inside/outside (binary)."
          : "mask: alpha from luminance — soft fade at edge.";
  }
  mode.addEventListener("change", render);
  render();
}

const SAMPLE_PATH_D = "M 80 280 C 120 80, 520 360, 560 120";

function mountPathHandlesDemo(canvas, toolbar, readout) {
  const editor = createPathEditor(canvas, {
    initialD: SAMPLE_PATH_D,
    allowDrag: false,
    onChange: ({ handles, d }) => {
      readout.textContent = `d="${d}"

handles (${handles.length}):
${handles
  .map((handle) => `${handle.id} [${handle.kind}] (${handle.point.x.toFixed(1)}, ${handle.point.y.toFixed(1)})`)
  .join("\n")}

anchor = vertex on path
control = Bézier handle`;
    }
  });
  void editor;
}

function mountHandleHitDemo(canvas, toolbar, readout) {
  const editor = createPathEditor(canvas, {
    initialD: SAMPLE_PATH_D,
    allowDrag: false,
    onChange: ({ handles }) => {
      readout.textContent = `${handles.length} handles ready — move pointer to hit test (radius 12)`;
    }
  });
  editor.svg.addEventListener("pointermove", (event) => {
    const rect = editor.svg.getBoundingClientRect();
    const viewBox = editor.svg.viewBox.baseVal;
    const point = {
      x: viewBox.x + ((event.clientX - rect.left) / rect.width) * viewBox.width,
      y: viewBox.y + ((event.clientY - rect.top) / rect.height) * viewBox.height
    };
    const hit = hitTestPathHandles(point, editor.getState().handles, 12);
    readout.textContent = `pointer=(${point.x.toFixed(1)}, ${point.y.toFixed(1)})
${hit ? `HIT ${hit.id} [${hit.kind}] at (${hit.point.x.toFixed(1)}, ${hit.point.y.toFixed(1)})` : "no handle"}
hit radius = 12`;
  });
}

function mountHandleDragDemo(canvas, toolbar, readout) {
  createPathEditor(canvas, {
    initialD: SAMPLE_PATH_D,
    allowDrag: true,
    onChange: ({ d, handles }) => {
      readout.textContent = `drag any handle — segment graph updates live

d="${d}"

${handles.length} handles — rebuilt path stays valid SVG`;
    }
  });
}

function mountPathEditorDemo(canvas, toolbar, readout) {
  const apply = el("button", "", "Apply d");
  apply.type = "button";
  const copy = el("button", "", "Copy d");
  copy.type = "button";
  toolbar.append(apply, copy);

  const editor = createPathEditor(canvas, {
    initialD: SAMPLE_PATH_D,
    allowDrag: true,
    onChange: updateReadout
  });

  const dField = document.createElement("textarea");
  dField.className = "path-d-field";
  dField.rows = 2;
  dField.value = SAMPLE_PATH_D;
  toolbar.append(dField);

  function updateReadout({ d }) {
    dField.value = d;
    readout.textContent = `Mini path editor — drag anchors (blue) and controls (white)
Paste or edit d below, then Apply.

live d:
${d}`;
  }

  apply.addEventListener("click", () => {
    try {
      editor.setPathD(dField.value.trim());
    } catch (error) {
      readout.textContent = `parse error: ${error.message}`;
    }
  });

  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(dField.value);
    readout.textContent = `${readout.textContent}\n\n(copied to clipboard)`;
  });
}

function mountWindingCompareDemo(canvas, toolbar, readout) {
  const rule = document.createElement("select");
  ["nonzero", "evenodd"].forEach((value) => rule.append(new Option(value, value)));
  toolbar.append(el("label", "", "fill-rule"), rule);
  const d = "M 0 0 L 40 40 L 40 0 L 0 40 Z";
  const segments = parsePathD(d);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 80 80");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("stroke", "#1e293b");
  path.setAttribute("stroke-width", "2");
  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "4");
  svg.append(path, marker);

  function render(point) {
    path.setAttribute("fill-rule", rule.value);
    const c = classifyPointInPath(point, segments, rule.value, { stepsPerCurve: 8 });
    path.setAttribute("fill", c.inside ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.25)");
    readout.textContent = `winding=${c.winding}  crossings=${c.crossings}
nonzero inside=${c.insideNonZero}  evenodd inside=${c.insideEvenOdd}
active rule (${rule.value}) inside=${c.inside}`;
  }

  svg.addEventListener("pointermove", (event) => {
    const point = svgPoint(svg, event);
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    render(point);
  });
  rule.addEventListener("change", () => render({ x: 20, y: 20 }));
  render({ x: 20, y: 20 });
}

function mountCompoundPathDemo(canvas, toolbar, readout) {
  const rule = document.createElement("select");
  ["nonzero", "evenodd"].forEach((v) => rule.append(new Option(v, v)));
  toolbar.append(el("label", "", "fill-rule"), rule);
  const d = "M 0 0 L 80 0 L 80 80 L 0 80 Z M 20 20 L 60 20 L 60 60 L 20 60 Z";
  const segments = parsePathD(d);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("stroke", "#1d4ed8");
  path.setAttribute("stroke-width", "2");
  svg.append(path);

  function paint() {
    path.setAttribute("fill-rule", rule.value);
    const hole = classifyPointInPath({ x: 40, y: 40 }, segments, rule.value);
    path.setAttribute("fill", "rgba(37,99,235,0.25)");
    readout.textContent = `2 subpaths (outer + inner)
hole center (40,40): winding=${hole.winding} crossings=${hole.crossings}
nonzero inside=${hole.insideNonZero}  evenodd inside=${hole.insideEvenOdd}
구멍을 만들려면 inner subpath winding을 반대로`;
  }
  rule.addEventListener("change", paint);
  paint();
}

function mountSelfIntersectDemo(canvas, toolbar, readout) {
  const rule = document.createElement("select");
  ["nonzero", "evenodd"].forEach((v) => rule.append(new Option(v, v)));
  toolbar.append(el("label", "", "fill-rule"), rule);
  const d = "M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z";
  const segments = parsePathD(d);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("stroke", "#0f172a");
  path.setAttribute("stroke-width", "1.5");
  svg.append(path);

  svg.addEventListener("pointermove", (event) => {
    const point = svgPoint(svg, event);
    const c = classifyPointInPath(point, segments, rule.value, { stepsPerCurve: 16 });
    path.setAttribute("fill-rule", rule.value);
    path.setAttribute("fill", c.inside ? "rgba(34,197,94,0.45)" : "rgba(248,250,252,0.8)");
    readout.textContent = `self-intersecting star
winding=${c.winding} crossings=${c.crossings}
inside (${rule.value})=${c.inside}`;
  });
  rule.addEventListener("change", () => {});
}

function mountPathBooleanDemo(canvas, toolbar, readout) {
  const op = document.createElement("select");
  ["union", "subtract", "intersect", "exclude"].forEach((v) => op.append(new Option(v, v)));
  toolbar.append(el("label", "", "boolean"), op);
  const segA = parsePathD("M 20 30 L 80 30 L 80 80 L 20 80 Z");
  const segB = parsePathD("M 55 35 L 105 35 L 105 85 L 55 85 Z");
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 140 100");
  canvas.append(svg);
  const pathA = document.createElementNS(svgNs(), "path");
  pathA.setAttribute("d", "M 20 30 L 80 30 L 80 80 L 20 80 Z");
  pathA.setAttribute("fill", "rgba(37,99,235,0.2)");
  pathA.setAttribute("stroke", "#2563eb");
  const pathB = document.createElementNS(svgNs(), "path");
  pathB.setAttribute("d", "M 55 35 L 105 35 L 105 85 L 55 85 Z");
  pathB.setAttribute("fill", "rgba(245,158,11,0.2)");
  pathB.setAttribute("stroke", "#d97706");
  const result = document.createElementNS(svgNs(), "rect");
  result.setAttribute("x", "0");
  result.setAttribute("y", "0");
  result.setAttribute("width", "140");
  result.setAttribute("height", "100");
  result.setAttribute("fill", "rgba(34,197,94,0.15)");
  svg.append(result, pathA, pathB);

  function paint() {
    readout.textContent = `boolean op=${op.value} (point sampling)
move pointer — green tint = true for sampled pixel`;
  }

  svg.addEventListener("pointermove", (event) => {
    const point = svgPoint(svg, event);
    const inside = pointInPathBoolean(point, segA, segB, op.value);
    result.setAttribute("fill", inside ? "rgba(34,197,94,0.35)" : "rgba(248,250,252,0.5)");
    readout.textContent = `pointer=(${point.x.toFixed(0)}, ${point.y.toFixed(0)})
${op.value} → inside=${inside}`;
  });
  op.addEventListener("change", paint);
  paint();
}

function mountHitPriorityDemo(canvas, toolbar, readout) {
  const strokeWidth = range("strokeWidth", 4, 32, 16);
  toolbar.append(strokeWidth.wrapper);
  const d = "M 60 200 C 160 80, 480 340, 580 120";
  const segments = parsePathD(d);
  const flat = flattenPathSegments(segments, { stepsPerCurve: 24 });
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "rgba(37,99,235,0.2)");
  path.setAttribute("stroke", "#0f172a");
  svg.append(path);

  svg.addEventListener("pointermove", (event) => {
    const point = svgPoint(svg, event);
    const sw = Number(strokeWidth.input.value);
    path.setAttribute("stroke-width", String(sw));
    const fillHit = classifyPointInPath(point, segments, "nonzero", { stepsPerCurve: 24 }).inside;
    let strokeHit = false;
    let minD = Infinity;
    for (let i = 1; i < flat.length; i += 1) {
      const dSeg = distancePointToSegment(point, flat[i - 1], flat[i]);
      minD = Math.min(minD, dSeg);
      if (dSeg <= sw / 2) strokeHit = true;
    }
    const target = strokeHit ? "stroke" : fillHit ? "fill" : "none";
    readout.textContent = `fill hit=${fillHit}  stroke hit=${strokeHit} (d<=${(sw / 2).toFixed(1)})
min distance=${minD.toFixed(2)}
editor picks: ${target} (stroke wins when both)`;
  });
}

function mountScanlineDemo(canvas, toolbar, readout) {
  const yLine = range("scan Y", 10, 90, 50);
  toolbar.append(yLine.wrapper);
  const d = "M 10 20 L 90 20 L 90 80 L 10 80 Z M 30 35 L 70 35 L 70 65 L 30 65 Z";
  const segments = parsePathD(d);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "rgba(37,99,235,0.15)");
  path.setAttribute("stroke", "#1d4ed8");
  const scan = document.createElementNS(svgNs(), "line");
  scan.setAttribute("stroke", "#ef4444");
  scan.setAttribute("stroke-width", "1");
  svg.append(path, scan);

  function render() {
    const y = Number(yLine.input.value);
    scan.setAttribute("x1", "0");
    scan.setAttribute("x2", "100");
    scan.setAttribute("y1", String(y));
    scan.setAttribute("y2", String(y));
    const samples = [];
    for (let x = 0; x <= 100; x += 2) {
      const c = classifyPointInPath({ x, y }, segments, "evenodd");
      if (c.inside) samples.push(x);
    }
    readout.textContent = `scanline y=${y} (evenodd)
inside spans (sampled): ${samples.length ? samples.join(",") : "none"}
rasterizer: parity flips at each edge crossing`;
  }
  yLine.input.addEventListener("input", render);
  render();
}

function mountFigmaFilterDemo(canvas, toolbar, readout) {
  const blur = range("blur radius", 0, 24, 8);
  const dy = range("offset Y", 0, 24, 4);
  toolbar.append(blur.wrapper, dy.wrapper);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", "220");
  shape.setAttribute("y", "140");
  shape.setAttribute("width", "200");
  shape.setAttribute("height", "120");
  shape.setAttribute("rx", "16");
  shape.setAttribute("fill", "#2563eb");
  svg.append(defs, shape);

  function render() {
    const effect = {
      offset: { x: 0, y: Number(dy.input.value) },
      radius: Number(blur.input.value),
      color: { r: 0, g: 0, b: 0, a: 0.25 }
    };
    const mapped = figmaDropShadowToSvgFilter(effect, "demo-shadow");
    defs.innerHTML = mapped.markup;
    shape.setAttribute("filter", mapped.filterAttr);
    readout.textContent = `Figma DROP_SHADOW → SVG
offset.y=${effect.offset.y}  radius=${effect.radius}
SVG feDropShadow dy=${mapped.svg.dy} stdDeviation=${mapped.svg.stdDeviation}

${mapped.markup}`;
  }
  [blur.input, dy.input].forEach((input) => input.addEventListener("input", render));
  render();
}

function mountFilterChainDemo(canvas, toolbar, readout) {
  const chain = buildDropShadowFilterChain({ offset: { x: 0, y: 6 }, radius: 10 }, "chain-demo");
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  defs.innerHTML = chain.markup;
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", "220");
  shape.setAttribute("y", "140");
  shape.setAttribute("width", "200");
  shape.setAttribute("height", "120");
  shape.setAttribute("rx", "16");
  shape.setAttribute("fill", "#2563eb");
  shape.setAttribute("filter", chain.filterAttr);
  svg.append(defs, shape);
  readout.textContent = `filter chain (manual drop shadow)
${chain.markup}

pipeline:
SourceAlpha → blur → offset → flood color → composite → merge with SourceGraphic`;
}

function mountFilterBlurMergeDemo(canvas, toolbar, readout) {
  const useShortcut = document.createElement("input");
  useShortcut.type = "checkbox";
  const label = el("label", "", "feDropShadow shortcut");
  label.prepend(useShortcut);
  toolbar.append(label);
  const blur = range("blur", 0, 20, 6);
  toolbar.append(blur.wrapper);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", "220");
  shape.setAttribute("y", "140");
  shape.setAttribute("width", "200");
  shape.setAttribute("height", "120");
  shape.setAttribute("rx", "16");
  shape.setAttribute("fill", "#2563eb");
  svg.append(defs, shape);

  function render() {
    const effect = { offset: { x: 0, y: 6 }, radius: Number(blur.input.value), color: { r: 0, g: 0, b: 0, a: 0.3 } };
    const mapped = useShortcut.checked
      ? figmaDropShadowToSvgFilter(effect, "blur-demo")
      : buildDropShadowFilterChain(effect, "blur-demo");
    defs.innerHTML = mapped.markup;
    shape.setAttribute("filter", mapped.filterAttr);
    readout.textContent = useShortcut.checked
      ? `feDropShadow shortcut\n${mapped.markup}`
      : `full chain\n${mapped.markup}`;
  }
  useShortcut.addEventListener("change", render);
  blur.input.addEventListener("input", render);
  render();
}

function mountFilterInnerDemo(canvas, toolbar, readout) {
  const blur = range("blur", 2, 16, 8);
  toolbar.append(blur.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", "200");
  shape.setAttribute("y", "120");
  shape.setAttribute("width", "240");
  shape.setAttribute("height", "160");
  shape.setAttribute("rx", "20");
  shape.setAttribute("fill", "#22c55e");
  svg.append(defs, shape);

  function render() {
    const mapped = figmaInnerShadowToSvgFilter(
      { radius: Number(blur.input.value), offset: { x: 0, y: 4 }, color: { r: 0, g: 0, b: 0, a: 0.45 } },
      "inner-demo"
    );
    defs.innerHTML = mapped.markup;
    shape.setAttribute("filter", mapped.filterAttr);
    readout.textContent = `INNER_SHADOW\n${mapped.markup}`;
  }
  blur.input.addEventListener("input", render);
  render();
}

function mountFilterBlurTypesDemo(canvas, toolbar, readout) {
  const mode = document.createElement("select");
  ["layer", "background"].forEach((v) => mode.append(new Option(v, v)));
  toolbar.append(el("label", "", "blur type"), mode);
  const amount = range("radius", 0, 24, 10);
  toolbar.append(amount.wrapper);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const back = document.createElementNS(svgNs(), "rect");
  back.setAttribute("x", "80");
  back.setAttribute("y", "80");
  back.setAttribute("width", "480");
  back.setAttribute("height", "260");
  back.setAttribute("fill", "url(#checker)");
  const checker = document.createElementNS(svgNs(), "pattern");
  checker.setAttribute("id", "checker");
  checker.setAttribute("width", "20");
  checker.setAttribute("height", "20");
  checker.setAttribute("patternUnits", "userSpaceOnUse");
  checker.innerHTML = '<rect width="10" height="10" fill="#e2e8f0"/><rect x="10" y="10" width="10" height="10" fill="#e2e8f0"/>';
  defs.append(checker);
  const card = document.createElementNS(svgNs(), "rect");
  card.setAttribute("x", "200");
  card.setAttribute("y", "130");
  card.setAttribute("width", "240");
  card.setAttribute("height", "150");
  card.setAttribute("rx", "16");
  card.setAttribute("fill", "rgba(255,255,255,0.85)");
  svg.append(defs, back, card);

  function render() {
    const radius = Number(amount.input.value);
    const mapped =
      mode.value === "layer"
        ? figmaLayerBlurToSvgFilter({ radius }, "layer-blur")
        : figmaBackgroundBlurToSvgFilter({ radius }, "bg-blur");
    defs.querySelectorAll("filter").forEach((node) => node.remove());
    defs.insertAdjacentHTML("beforeend", mapped.markup);
    card.setAttribute("filter", mapped.filterAttr);
    readout.textContent =
      mode.value === "layer"
        ? `LAYER_BLUR blurs merged layer pixels (SourceGraphic)
CSS: filter: blur() on element

${mapped.markup}`
        : `BACKGROUND_BLUR samples BackgroundImage (conceptual in SVG)
CSS: backdrop-filter: blur()

${mapped.markup}`;
  }
  mode.addEventListener("change", render);
  amount.input.addEventListener("input", render);
  render();
}

function mountFigmaVectorNetworkDemo(canvas, toolbar, readout) {
  const sampleD = "M 80 120 C 140 40, 500 360, 560 120";
  const network = pathDToFigmaNetwork(sampleD);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", sampleD);
  path.setAttribute("fill", "rgba(37,99,235,0.2)");
  path.setAttribute("stroke", "#1d4ed8");
  path.setAttribute("stroke-width", "3");
  svg.append(path);

  readout.textContent = `${FIGMA_VECTOR_MODEL.figma}
→ ${FIGMA_VECTOR_MODEL.svg}

path d:
${sampleD}

figma network:
${JSON.stringify(network, null, 2)}

rebuilt d:
${figmaNetworkToPathD(network)}`;
}

function mountFigmaFillStrokeDemo(canvas, toolbar, readout) {
  const weight = range("strokeWeight", 1, 12, 4);
  toolbar.append(weight.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const bbox = { x: 180, y: 100, width: 280, height: 180 };
  const gradient = figmaLinearGradientPaintToSvg(
    {
      type: "GRADIENT_LINEAR",
      gradientHandlePositions: [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 }
      ],
      gradientStops: [
        { position: 0, color: { r: 0.15, g: 0.39, b: 0.92, a: 1 } },
        { position: 1, color: { r: 0.96, g: 0.62, b: 0.04, a: 1 } }
      ]
    },
    bbox,
    { gradientId: "figma-fill" }
  );
  defs.innerHTML = gradient.markup;
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", String(bbox.x));
  shape.setAttribute("y", String(bbox.y));
  shape.setAttribute("width", String(bbox.width));
  shape.setAttribute("height", String(bbox.height));
  shape.setAttribute("rx", "16");
  svg.append(defs, shape);

  function render() {
    const stroke = figmaStrokeToSvgAttributes({
      color: { r: 0.06, g: 0.09, b: 0.16, a: 1 },
      weight: Number(weight.input.value),
      cap: "ROUND",
      join: "ROUND"
    });
    shape.setAttribute("fill", gradient.fill);
    Object.entries(stroke).forEach(([key, value]) => shape.setAttribute(key, String(value)));
    readout.textContent = `fill (GRADIENT_LINEAR):
${gradient.markup}

stroke attrs:
${JSON.stringify(stroke, null, 2)}`;
  }
  weight.input.addEventListener("input", render);
  render();
}

function mountFigmaBooleanDemo(canvas, toolbar, readout) {
  const op = document.createElement("select");
  FIGMA_BOOLEAN_MAP.forEach((row) => op.append(new Option(row.figma, row.figma)));
  toolbar.append(el("label", "", "boolean"), op);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const pathA = document.createElementNS(svgNs(), "path");
  pathA.setAttribute("d", "M 120 140 L 320 140 L 320 300 L 120 300 Z");
  pathA.setAttribute("fill", "rgba(37,99,235,0.25)");
  pathA.setAttribute("stroke", "#2563eb");
  const pathB = document.createElementNS(svgNs(), "path");
  pathB.setAttribute("d", "M 220 180 L 420 180 L 420 340 L 220 340 Z");
  pathB.setAttribute("fill", "rgba(245,158,11,0.25)");
  pathB.setAttribute("stroke", "#d97706");
  const merged = document.createElementNS(svgNs(), "path");
  merged.setAttribute("fill", "#22c55e");
  merged.setAttribute("stroke", "#15803d");
  merged.setAttribute("stroke-width", "2");
  svg.append(pathA, pathB, merged);

  function render() {
    const result = figmaBooleanPathsToSvg(
      [{ d: pathA.getAttribute("d") }, { d: pathB.getAttribute("d") }],
      op.value
    );
    merged.setAttribute("d", result.d);
    merged.setAttribute("fill-rule", result.fillRule);
    const row = FIGMA_BOOLEAN_MAP.find((item) => item.figma === op.value);
    readout.textContent = `${row.figma} → fill-rule=${row.fillRule}
${row.svg}

merged path:
${result.svg}`;
  }
  op.addEventListener("change", render);
  render();
}

function mountFigmaClipMaskDemo(canvas, toolbar, readout) {
  const mode = document.createElement("select");
  ["clip", "mask"].forEach((v) => mode.append(new Option(v, v)));
  toolbar.append(el("label", "", "mode"), mode);

  const shapeD = "M 220 120 L 420 120 L 320 300 Z";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const back = document.createElementNS(svgNs(), "rect");
  back.setAttribute("width", "640");
  back.setAttribute("height", "420");
  back.setAttribute("fill", "#e2e8f0");
  const content = document.createElementNS(svgNs(), "g");
  const tri = document.createElementNS(svgNs(), "path");
  tri.setAttribute("d", shapeD);
  tri.setAttribute("fill", "#2563eb");
  content.append(tri);
  svg.append(defs, back, content);

  function render() {
    defs.innerHTML = "";
    if (mode.value === "clip") {
      const clip = figmaClipToSvgMarkup({ pathD: shapeD }, "figma-clip");
      defs.innerHTML = clip.markup;
      content.setAttribute("clip-path", clip.clipPathAttr);
      content.removeAttribute("mask");
      readout.textContent = `clipPath (hard edge)\n${clip.markup}`;
    } else {
      const mask = figmaMaskToSvgMarkup({ pathD: shapeD }, "figma-mask");
      defs.innerHTML = mask.markup;
      content.setAttribute("mask", mask.maskAttr);
      content.removeAttribute("clip-path");
      readout.textContent = `mask (alpha)\n${mask.markup}`;
    }
  }
  mode.addEventListener("change", render);
  render();
}

function mountFigmaEffectsAllDemo(canvas, toolbar, readout) {
  const type = document.createElement("select");
  FIGMA_EFFECT_FILTER_MAP.forEach((row) => type.append(new Option(row.figma, row.figma)));
  toolbar.append(el("label", "", "effect"), type);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", "220");
  shape.setAttribute("y", "140");
  shape.setAttribute("width", "200");
  shape.setAttribute("height", "120");
  shape.setAttribute("rx", "16");
  shape.setAttribute("fill", "#2563eb");
  svg.append(defs, shape);

  function render() {
    const mapped = figmaEffectToSvgFilter({
      type: type.value,
      offset: { x: 0, y: 6 },
      radius: type.value === "LAYER_BLUR" || type.value === "BACKGROUND_BLUR" ? 12 : 8,
      color: { r: 0, g: 0, b: 0, a: 0.35 }
    });
    defs.innerHTML = mapped.markup;
    shape.setAttribute("filter", mapped.filterAttr);
    const row = FIGMA_EFFECT_FILTER_MAP.find((item) => item.figma === type.value);
    readout.textContent = `${row.figma}
SVG: ${row.svg}
${row.notes}

${mapped.markup}`;
  }
  type.addEventListener("change", render);
  render();
}

function mountRadialGradientDemo(canvas, toolbar, readout) {
  const radius = range("radius", 30, 160, 90);
  const fx = range("focal X", 120, 520, 320);
  toolbar.append(radius.wrapper, fx.wrapper);
  const bbox = { x: 160, y: 80, width: 320, height: 200 };
  const stops = [
    { offset: 0, color: "#2563eb" },
    { offset: 0.6, color: "#22c55e" },
    { offset: 1, color: "#f59e0b" }
  ];

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const grad = document.createElementNS(svgNs(), "radialGradient");
  grad.setAttribute("id", "rg");
  grad.setAttribute("gradientUnits", "userSpaceOnUse");
  stops.forEach((stop) => {
    const node = document.createElementNS(svgNs(), "stop");
    node.setAttribute("offset", String(stop.offset));
    node.setAttribute("stop-color", stop.color);
    grad.append(node);
  });
  defs.append(grad);
  const rect = document.createElementNS(svgNs(), "rect");
  rect.setAttribute("x", String(bbox.x));
  rect.setAttribute("y", String(bbox.y));
  rect.setAttribute("width", String(bbox.width));
  rect.setAttribute("height", String(bbox.height));
  rect.setAttribute("fill", "url(#rg)");
  rect.setAttribute("stroke", "#1e293b");
  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "6");
  marker.setAttribute("fill", "#ef4444");
  svg.append(defs, rect, marker);

  function render() {
    const cx = 320;
    const cy = 180;
    const r = Number(radius.input.value);
    const focalX = Number(fx.input.value);
    grad.setAttribute("cx", String(cx));
    grad.setAttribute("cy", String(cy));
    grad.setAttribute("r", String(r));
    grad.setAttribute("fx", String(focalX));
    grad.setAttribute("fy", String(cy));
    readout.textContent = `radialGradient userSpaceOnUse
center=(${cx},${cy}) r=${r} focal=(${focalX},${cy})
move pointer to sample t along focal→point ray`;
  }

  svg.addEventListener("pointermove", (event) => {
    const point = svgPoint(svg, event);
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    const sample = sampleRadialGradient(
      point,
      {
        gradientUnits: "userSpaceOnUse",
        cx,
        cy,
        fx: Number(fx.input.value),
        fy: cy,
        r: Number(radius.input.value),
        stops
      },
      bbox
    );
    readout.textContent = `pointer=(${point.x.toFixed(0)}, ${point.y.toFixed(0)})
raw t=${sample.t.toFixed(3)}  mapped t=${sample.mappedT.toFixed(3)}
color=${colorToCss(sample.color)}`;
  });

  [radius.input, fx.input].forEach((input) => input.addEventListener("input", render));
  render();
}

function mountPatternTileDemo(canvas, toolbar, readout) {
  const tile = range("tile size", 16, 64, 32);
  toolbar.append(tile.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const patternMarkup = buildPatternMarkup({
    id: "grid",
    width: 32,
    height: 32,
    patternUnits: "userSpaceOnUse",
    content: '<rect width="32" height="32" fill="#f8fafc"/><path d="M 0 32 L 32 0" stroke="#94a3b8" stroke-width="2"/>'
  });
  defs.innerHTML = patternMarkup;
  const field = document.createElementNS(svgNs(), "rect");
  field.setAttribute("x", "40");
  field.setAttribute("y", "40");
  field.setAttribute("width", "560");
  field.setAttribute("height", "340");
  field.setAttribute("fill", "url(#grid)");
  field.setAttribute("stroke", "#cbd5e1");
  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "5");
  marker.setAttribute("fill", "#ef4444");
  svg.append(defs, field, marker);

  function render() {
    const size = Number(tile.input.value);
    defs.innerHTML = buildPatternMarkup({
      id: "grid",
      width: size,
      height: size,
      patternUnits: "userSpaceOnUse",
      content: `<rect width="${size}" height="${size}" fill="#f8fafc"/><path d="M 0 ${size} L ${size} 0" stroke="#94a3b8" stroke-width="2"/>`
    });
    field.setAttribute("fill", "url(#grid)");
    readout.textContent = `pattern tile ${size}×${size} — move pointer`;
  }

  svg.addEventListener("pointermove", (event) => {
    const point = svgPoint(svg, event);
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    const coords = patternTileCoordinates(point, { x: 40, y: 40 }, Number(tile.input.value), Number(tile.input.value));
    readout.textContent = `pointer=(${point.x.toFixed(0)}, ${point.y.toFixed(0)})
tile=(${coords.tileX}, ${coords.tileY})  local u,v=(${coords.u.toFixed(2)}, ${coords.v.toFixed(2)})
local px=(${coords.localX.toFixed(1)}, ${coords.localY.toFixed(1)})`;
  });
  tile.input.addEventListener("input", render);
  render();
}

function mountGradientSpreadDemo(canvas, toolbar, readout) {
  const spread = document.createElement("select");
  ["pad", "repeat", "reflect"].forEach((v) => spread.append(new Option(v, v)));
  const units = document.createElement("select");
  ["objectBoundingBox", "userSpaceOnUse"].forEach((v) => units.append(new Option(v, v)));
  toolbar.append(el("label", "", "spread"), spread, el("label", "", "units"), units);

  const bbox = { x: 120, y: 100, width: 400, height: 180 };
  const stops = [
    { offset: 0, color: "#2563eb" },
    { offset: 1, color: "#f59e0b" }
  ];
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const grad = document.createElementNS(svgNs(), "linearGradient");
  grad.setAttribute("id", "lg");
  stops.forEach((stop) => {
    const node = document.createElementNS(svgNs(), "stop");
    node.setAttribute("offset", String(stop.offset));
    node.setAttribute("stop-color", stop.color);
    grad.append(node);
  });
  defs.append(grad);
  const rect = document.createElementNS(svgNs(), "rect");
  rect.setAttribute("x", String(bbox.x));
  rect.setAttribute("y", String(bbox.y));
  rect.setAttribute("width", String(bbox.width));
  rect.setAttribute("height", String(bbox.height));
  rect.setAttribute("fill", "url(#lg)");
  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "6");
  marker.setAttribute("fill", "#ef4444");
  svg.append(defs, rect, marker);

  function syncGradient() {
    grad.setAttribute("gradientUnits", units.value);
    grad.setAttribute("spreadMethod", spread.value);
    if (units.value === "objectBoundingBox") {
      grad.setAttribute("x1", "0");
      grad.setAttribute("y1", "0");
      grad.setAttribute("x2", "1.2");
      grad.setAttribute("y2", "0");
    } else {
      grad.setAttribute("x1", String(bbox.x));
      grad.setAttribute("y1", String(bbox.y + bbox.height / 2));
      grad.setAttribute("x2", String(bbox.x + bbox.width * 1.2));
      grad.setAttribute("y2", String(bbox.y + bbox.height / 2));
    }
  }

  svg.addEventListener("pointermove", (event) => {
    const point = svgPoint(svg, event);
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    const def =
      units.value === "objectBoundingBox"
        ? { gradientUnits: units.value, x1: 0, y1: 0, x2: 1.2, y2: 0, spreadMethod: spread.value, stops }
        : {
            gradientUnits: units.value,
            x1: bbox.x,
            y1: bbox.y + bbox.height / 2,
            x2: bbox.x + bbox.width * 1.2,
            y2: bbox.y + bbox.height / 2,
            spreadMethod: spread.value,
            stops
          };
    const sample = sampleLinearGradient(point, def, bbox);
    readout.textContent = `spreadMethod=${spread.value}  units=${units.value}
raw t=${sample.t.toFixed(3)} → mapped t=${sample.mappedT.toFixed(3)}
applySpreadMethod(${sample.t.toFixed(2)})=${applySpreadMethod(sample.t, spread.value).toFixed(3)}
color=${colorToCss(sample.color)}`;
  });

  [spread, units].forEach((control) =>
    control.addEventListener("change", () => {
      syncGradient();
    })
  );
  syncGradient();
}

const DEMO_ICON_D =
  "M 4.3 8.7 L 12.1 3.9 L 19.8 8.2 L 17.5 20.3 L 6.9 20.1 Z";

function mountIconGridDemo(canvas, toolbar, readout) {
  const halfPixel = document.createElement("input");
  halfPixel.type = "checkbox";
  halfPixel.checked = true;
  const strokeInput = document.createElement("input");
  strokeInput.type = "range";
  strokeInput.min = "0.5";
  strokeInput.max = "3";
  strokeInput.step = "0.25";
  strokeInput.value = "1.25";
  toolbar.append(el("label", "", "half-pixel snap"), halfPixel, el("label", "", "stroke"), strokeInput);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 320 200");
  canvas.append(svg);
  const grid = document.createElementNS(svgNs(), "g");
  grid.setAttribute("stroke", "#e2e8f0");
  grid.setAttribute("stroke-width", "0.05");
  for (let i = 0; i <= 24; i += 1) {
    const v = document.createElementNS(svgNs(), "line");
    v.setAttribute("x1", String(i));
    v.setAttribute("y1", "0");
    v.setAttribute("x2", String(i));
    v.setAttribute("y2", "24");
    const h = document.createElementNS(svgNs(), "line");
    h.setAttribute("x1", "0");
    h.setAttribute("y1", String(i));
    h.setAttribute("x2", "24");
    h.setAttribute("y2", String(i));
    grid.append(v, h);
  }
  const raw = document.createElementNS(svgNs(), "path");
  raw.setAttribute("fill", "none");
  raw.setAttribute("stroke", "#94a3b8");
  raw.setAttribute("stroke-dasharray", "0.4 0.4");
  const snapped = document.createElementNS(svgNs(), "path");
  snapped.setAttribute("fill", "rgba(37,99,235,0.15)");
  snapped.setAttribute("stroke", "#2563eb");
  const g = document.createElementNS(svgNs(), "g");
  g.setAttribute("transform", "translate(40,20) scale(8)");
  g.append(grid, raw, snapped);
  svg.append(g);

  function render() {
    const crisp = nearestCrispStrokeWidth(Number(strokeInput.value));
    const path = halfPixel.checked ? snapPathDToIconGrid(DEMO_ICON_D, true) : pathFromD(DEMO_ICON_D);
    raw.setAttribute("d", DEMO_ICON_D);
    snapped.setAttribute("d", path.d);
    snapped.setAttribute("stroke-width", String(crisp / 8));
    readout.textContent = `raw vs snapped (24×24 grid, ×8 preview)
stroke request=${strokeInput.value} → crisp=${crisp}
half-pixel snap=${halfPixel.checked}

snapped d:
${path.d}`;
  }
  [halfPixel, strokeInput].forEach((node) => node.addEventListener("input", render));
  render();
}

function mountIconFillStrokeDemo(canvas, toolbar, readout) {
  const style = document.createElement("select");
  ["fill", "stroke"].forEach((v) => style.append(new Option(v, v)));
  toolbar.append(el("label", "", "style"), style);

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const fillPath = document.createElementNS(svgNs(), "path");
  fillPath.setAttribute("transform", "translate(120,80) scale(12)");
  fillPath.setAttribute("fill", "#2563eb");
  const strokePath = document.createElementNS(svgNs(), "path");
  strokePath.setAttribute("transform", "translate(360,80) scale(12)");
  strokePath.setAttribute("fill", "none");
  strokePath.setAttribute("stroke", "#2563eb");
  strokePath.setAttribute("stroke-linejoin", "round");
  svg.append(fillPath, strokePath);

  function render() {
    const d = snapPathDToIconGrid(DEMO_ICON_D, true).d;
    fillPath.setAttribute("d", d);
    strokePath.setAttribute("d", d);
    strokePath.setAttribute("stroke-width", String(nearestCrispStrokeWidth(1.5) / 12));
    const active = style.value === "fill" ? fillPath : strokePath;
    readout.textContent = `${style.value} icon — closed path, crisp stroke-width
active: ${style.value === "fill" ? "fill=solid" : "stroke=centerline"}

d=${d}`;
    fillPath.setAttribute("opacity", style.value === "fill" ? "1" : "0.35");
    strokePath.setAttribute("opacity", style.value === "stroke" ? "1" : "0.35");
  }
  style.addEventListener("change", render);
  render();
}

function mountIconSpriteDemo(canvas, toolbar, readout) {
  const tint = document.createElement("input");
  tint.type = "color";
  tint.value = "#2563eb";
  toolbar.append(el("label", "", "CSS color"), tint);

  const star = '<path d="M 12 2 L 14.5 9 L 22 9 L 16 13.5 L 18 21 L 12 17 L 6 21 L 8 13.5 L 2 9 L 9.5 9 Z"/>';
  const heart =
    '<path d="M 12 21 C 12 21 3 14 3 9 C 3 6 5.5 4 8 4 C 10 4 12 6 12 6 C 12 6 14 4 16 4 C 18.5 4 21 6 21 9 C 21 14 12 21 12 21 Z"/>';
  const symbols = [
    buildSvgSymbol({ id: "icon-star", content: star, attributes: currentColorAttributes("fill") }),
    buildSvgSymbol({
      id: "icon-heart",
      content: heart,
      attributes: currentColorAttributes("stroke")
    })
  ];
  const sheet = buildSvgSpriteSheet(symbols);
  canvas.innerHTML = sheet;
  const host = canvas.querySelector("svg");
  host.removeAttribute("style");
  host.setAttribute("viewBox", "0 0 640 200");
  host.setAttribute("width", "100%");
  host.setAttribute("height", "200");
  const uses = document.createElementNS(svgNs(), "g");
  uses.setAttribute("color", tint.value);
  uses.innerHTML =
    buildSvgUse({ href: "#icon-star", x: 80, y: 40, width: 96, height: 96 }) +
    buildSvgUse({ href: "#icon-heart", x: 280, y: 40, width: 96, height: 96 });
  host.append(uses);

  tint.addEventListener("input", () => {
    uses.setAttribute("color", tint.value);
    readout.textContent = `sprite + <use> — tint via CSS color → currentColor
${sheet}

data URI length=${svgMarkupToDataUri(sheet).length}`;
  });
  tint.dispatchEvent(new Event("input"));
}

function mountIconSimplifyDemo(canvas, toolbar, readout) {
  const tolerance = range("tolerance", 0.2, 4, 1.2, 0.1);
  toolbar.append(tolerance.wrapper);
  const dense =
    "M 0 12 C 3 2, 9 22, 12 12 C 15 2, 21 22, 24 12 C 21 2, 15 22, 12 12 C 9 2, 3 22, 0 12 Z";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const g = document.createElementNS(svgNs(), "g");
  g.setAttribute("transform", "translate(80,60) scale(18)");
  const original = document.createElementNS(svgNs(), "polyline");
  original.setAttribute("fill", "none");
  original.setAttribute("stroke", "#94a3b8");
  original.setAttribute("stroke-width", "0.08");
  const simplified = document.createElementNS(svgNs(), "path");
  simplified.setAttribute("fill", "rgba(37,99,235,0.12)");
  simplified.setAttribute("stroke", "#2563eb");
  simplified.setAttribute("stroke-width", "0.12");
  g.append(original, simplified);
  svg.append(g);

  function render() {
    const flat = flattenPathSegments(parsePathD(dense), { stepsPerCurve: 12 });
    const points = flat.map((p) => `${p.x},${p.y}`).join(" ");
    original.setAttribute("points", points);
    const result = simplifyPathD(dense, Number(tolerance.input.value), { stepsPerCurve: 12 });
    simplified.setAttribute("d", result.d);
    readout.textContent = `Douglas–Peucker tolerance=${tolerance.input.value}
${result.originalCount} flatten points → ${result.pointCount} polyline vertices

${result.d}`;
  }
  tolerance.input.addEventListener("input", render);
  render();
}

function mountSvgCurrentColorDemo(canvas, toolbar, readout) {
  const color = document.createElement("input");
  color.type = "color";
  color.value = "#dc2626";
  toolbar.append(el("label", "", "color"), color);
  const wrap = el("div", "icon-tint-row");
  wrap.style.display = "flex";
  wrap.style.gap = "24px";
  wrap.style.alignItems = "center";
  wrap.style.color = color.value;
  const attrs = currentColorAttributes("both");
  ["A", "B", "C"].forEach((label) => {
    const box = el("div", "icon-tint-box");
    box.style.color = color.value;
    box.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><circle cx="12" cy="12" r="9" fill="${attrs.fill}" stroke="${attrs.stroke}" stroke-width="1.5"/><text x="12" y="16" text-anchor="middle" font-size="10" fill="${attrs.fill}">${label}</text></svg>`;
    wrap.append(box);
  });
  canvas.append(wrap);
  color.addEventListener("input", () => {
    wrap.style.color = color.value;
    wrap.querySelectorAll(".icon-tint-box").forEach((box) => {
      box.style.color = color.value;
    });
    readout.textContent = `parent { color: ${color.value} }
SVG fill/stroke="currentColor" inherits CSS color
${JSON.stringify(currentColorAttributes("both"), null, 2)}`;
  });
  color.dispatchEvent(new Event("input"));
}

function mountSvgSpriteUriDemo(canvas, toolbar, readout) {
  const preview = el("div", "sprite-uri-preview");
  preview.style.display = "flex";
  preview.style.gap = "16px";
  preview.style.flexWrap = "wrap";
  canvas.append(preview);
  const sym = buildSvgSymbol({
    id: "dot",
    viewBox: "0 0 8 8",
    content: '<circle cx="4" cy="4" r="3" fill="currentColor"/>',
    attributes: currentColorAttributes("fill")
  });
  const sheet = buildSvgSpriteSheet([sym], { hidden: false });
  const uri = svgMarkupToDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#2563eb"/></svg>`
  );
  const box = el("div", "");
  box.style.width = "96px";
  box.style.height = "96px";
  box.style.backgroundColor = "#e2e8f0";
  box.style.backgroundImage = `url("${uri}")`;
  box.style.backgroundSize = "contain";
  preview.append(box);
  const inline = el("div", "");
  inline.innerHTML = sheet + buildSvgUse({ href: "#dot", x: 120, y: 20, width: 48, height: 48 });
  preview.append(inline);
  readout.textContent = `sprite sheet (hidden defs) + <use>
data URI for CSS background-image:
${uri.slice(0, 120)}…`;
}

function mountSvgOptimizeDemo(canvas, toolbar, readout) {
  const padding = range("padding", 0, 4, 1);
  const tol = range("simplify ε", 0.3, 3, 1.2, 0.1);
  toolbar.append(padding.wrapper, tol.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 320");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("fill", "#2563eb");
  path.setAttribute("opacity", "0.85");
  svg.append(path);

  function render() {
    const raw = "M 2 10 C 8 0, 16 20, 22 10 L 22 18 L 2 18 Z";
    const simplified = simplifyPathD(raw, Number(tol.input.value));
    const vb = optimizeSvgViewBox({ width: 24, height: 24, padding: Number(padding.input.value) });
    svg.setAttribute("viewBox", vb.viewBox);
    path.setAttribute("d", simplified.d);
    readout.textContent = `optimizeSvgViewBox → ${vb.viewBox}
simplify ${simplified.originalCount}→${simplified.pointCount} points

${simplified.d}`;
  }
  [padding.input, tol.input].forEach((input) => input.addEventListener("input", render));
  render();
}

function mountEngineDashOffsetDemo(canvas, toolbar, readout) {
  const dashInput = document.createElement("input");
  dashInput.type = "text";
  dashInput.value = "16 8";
  const offsetRange = range("dashoffset", 0, 80, 0);
  const offsetDist = range("path offset", -20, 20, 6);
  toolbar.append(el("label", "", "dasharray"), dashInput, offsetRange.wrapper, offsetDist.wrapper);

  const baseD = "M 80 300 C 160 80, 480 360, 560 120";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const base = document.createElementNS(svgNs(), "path");
  base.setAttribute("d", baseD);
  base.setAttribute("fill", "none");
  base.setAttribute("stroke", "#cbd5e1");
  base.setAttribute("stroke-width", "4");
  const dashed = document.createElementNS(svgNs(), "path");
  dashed.setAttribute("d", baseD);
  dashed.setAttribute("fill", "none");
  dashed.setAttribute("stroke", "#2563eb");
  dashed.setAttribute("stroke-width", "4");
  dashed.setAttribute("stroke-linecap", "round");
  const offsetPath = document.createElementNS(svgNs(), "path");
  offsetPath.setAttribute("fill", "none");
  offsetPath.setAttribute("stroke", "#f59e0b");
  offsetPath.setAttribute("stroke-width", "2");
  svg.append(base, offsetPath, dashed);

  function render() {
    const pattern = parseDashArray(dashInput.value);
    const total = pathLength(pathFromD(baseD).segments);
    dashed.setAttribute("stroke-dasharray", formatDashArray(pattern));
    dashed.setAttribute("stroke-dashoffset", offsetRange.input.value);
    const intervals = strokeDashIntervals(total, pattern, Number(offsetRange.input.value));
    const offset = offsetPathD(baseD, Number(offsetDist.input.value));
    offsetPath.setAttribute("d", offset.d);
    readout.textContent = `length=${total.toFixed(1)}  dash on-intervals=${intervals.length}
offset path points=${offset.pointCount}

${intervals.slice(0, 4).map((i) => `[${i.start.toFixed(1)}, ${i.end.toFixed(1)}]`).join(" ")}`;
  }
  [dashInput, offsetRange.input, offsetDist.input].forEach((node) => node.addEventListener("input", render));
  render();
}

function mountEngineAdaptiveFlattenDemo(canvas, toolbar, readout) {
  const tolerance = range("tolerance", 0.1, 8, 1, 0.1);
  const steps = range("uniform steps", 4, 32, 16);
  toolbar.append(tolerance.wrapper, steps.wrapper);
  const d = "M 40 320 C 120 40, 520 380, 600 120";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const curve = document.createElementNS(svgNs(), "path");
  curve.setAttribute("d", d);
  curve.setAttribute("fill", "none");
  curve.setAttribute("stroke", "#94a3b8");
  curve.setAttribute("stroke-width", "2");
  const uniformLayer = document.createElementNS(svgNs(), "g");
  const adaptiveLayer = document.createElementNS(svgNs(), "g");
  svg.append(curve, uniformLayer, adaptiveLayer);

  function render() {
    const segments = pathFromD(d).segments;
    const stats = compareFlattenMethods(segments, {
      tolerance: Number(tolerance.input.value),
      stepsPerCurve: Number(steps.input.value)
    });
    const uniformPts = flattenPathSegments(segments, { stepsPerCurve: Number(steps.input.value) });
    const adaptivePts = flattenPathSegmentsAdaptive(segments, { tolerance: Number(tolerance.input.value) });
    uniformLayer.replaceChildren();
    adaptiveLayer.replaceChildren();
    const drawDots = (layer, points, color) => {
      points.forEach((point) => {
        const dot = document.createElementNS(svgNs(), "circle");
        dot.setAttribute("cx", String(point.x));
        dot.setAttribute("cy", String(point.y));
        dot.setAttribute("r", "4");
        dot.setAttribute("fill", color);
        layer.append(dot);
      });
    };
    drawDots(uniformLayer, uniformPts, "#94a3b8");
    drawDots(adaptiveLayer, adaptivePts, "#2563eb");
    readout.textContent = `uniform ${stats.uniformCount} pts (gray)  length=${stats.uniformLength.toFixed(1)}
adaptive ${stats.adaptiveCount} pts (blue)  length=${stats.adaptiveLength.toFixed(1)}`;
  }
  [tolerance.input, steps.input].forEach((input) => input.addEventListener("input", render));
  render();
}

function mountEngineArcCubicDemo(canvas, toolbar, readout) {
  const arcD = "M 120 300 A 120 80 0 0 1 520 300";
  const converted = convertArcsInPathD(arcD);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const arcPath = document.createElementNS(svgNs(), "path");
  arcPath.setAttribute("d", arcD);
  arcPath.setAttribute("fill", "none");
  arcPath.setAttribute("stroke", "#94a3b8");
  arcPath.setAttribute("stroke-width", "3");
  arcPath.setAttribute("stroke-dasharray", "8 6");
  const cubicPath = document.createElementNS(svgNs(), "path");
  cubicPath.setAttribute("d", converted.d);
  cubicPath.setAttribute("fill", "none");
  cubicPath.setAttribute("stroke", "#2563eb");
  cubicPath.setAttribute("stroke-width", "3");
  const handles = document.createElementNS(svgNs(), "g");
  svg.append(arcPath, cubicPath, handles);

  const segment = parsePathD(arcD).find((s) => s.type === "A");
  arcSegmentToCubics(segment).forEach((cubic) => {
    [cubic.cp1, cubic.cp2].forEach((point) => {
      const dot = document.createElementNS(svgNs(), "circle");
      dot.setAttribute("cx", String(point.x));
      dot.setAttribute("cy", String(point.y));
      dot.setAttribute("r", "5");
      dot.setAttribute("fill", "#f59e0b");
      handles.append(dot);
    });
  });

  readout.textContent = `arc segments=${converted.arcCount}
cubic count=${arcSegmentToCubics(segment).length}

before: ${arcD}
after: ${converted.d}`;
}

function mountEngineMultiSubpathDemo(canvas, toolbar, readout) {
  toolbar.append(el("span", "", "drag handles per subpath"));
  const editor = createCompoundPathEditor(canvas, {
    initialD: "M 80 200 L 200 80 L 320 200 Z M 400 120 L 560 120 L 560 280 L 400 280 Z",
    onChange(state) {
      readout.textContent = `subpaths=${listSubpathHandles(state.segments).reduce((max, h) => Math.max(max, h.subpathIndex + 1), 0)}
handles=${state.handles.length}

${state.d}`;
    }
  });
  void editor;
}

function mountPrimerCapabilityMapDemo(canvas, toolbar, readout) {
  const wrap = el("div", "primer-map");
  wrap.style.fontFamily = "ui-monospace, monospace";
  wrap.style.fontSize = "12px";
  wrap.style.lineHeight = "1.6";
  wrap.innerHTML = `<h3 style="margin:0 0 8px">SVG capability map</h3><pre>${SVG_CAPABILITY_MAP.map((r) => `${r.topic.padEnd(28)} ${r.repo.padEnd(22)} ${r.lesson}`).join("\n")}</pre><h3 style="margin:16px 0 8px">Figma ↔ SVG layers</h3><pre>${FIGMA_SVG_LAYERS.map((r) => `${r.layer.padEnd(14)} ${r.figma}`).join("\n")}</pre>`;
  canvas.append(wrap);
  const model = pathPaintModel();
  readout.textContent = `fill: ${model.fill}\nstroke: ${model.stroke}\npaint-order: ${model.paintOrder}\nFigma align: ${model.figmaStrokeAlign}`;
}

function mountPrimerCoordinateStackDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const rect = document.createElementNS(svgNs(), "rect");
  rect.setAttribute("width", "640");
  rect.setAttribute("height", "420");
  rect.setAttribute("fill", "#f8fafc");
  const marker = document.createElementNS(svgNs(), "circle");
  marker.setAttribute("r", "8");
  marker.setAttribute("fill", "#2563eb");
  svg.append(rect, marker);
  svg.addEventListener("pointermove", (event) => {
    const point = svgPoint(svg, event);
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    const stack = explainCoordinateStack(
      { x: event.clientX - svg.getBoundingClientRect().left, y: event.clientY - svg.getBoundingClientRect().top },
      { width: 640, height: 420 },
      { x: 0, y: 0, width: 640, height: 420 }
    );
    readout.textContent = `${stack.note}
pointer(px)=(${stack.pointer.x.toFixed(0)}, ${stack.pointer.y.toFixed(0)})
user=(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`;
  });
}

function mountFigmaPaintGapDemo(canvas, toolbar, readout) {
  const type = document.createElement("select");
  FIGMA_PAINT_GAP_MAP.forEach((row) => type.append(new Option(row.figma, row.figma)));
  toolbar.append(el("label", "", "paint"), type);
  function render() {
    const row = FIGMA_PAINT_GAP_MAP.find((r) => r.figma === type.value);
    const sample = figmaPaintToSvg(
      {
        type: type.value,
        color: { r: 0.15, g: 0.39, b: 0.92, a: 1 },
        gradientStops: [
          { position: 0, color: { r: 0.15, g: 0.39, b: 0.92, a: 1 } },
          { position: 1, color: { r: 0.98, g: 0.75, b: 0.14, a: 1 } }
        ],
        imageRef: "#pattern"
      },
      { x: 0, y: 0, width: 100, height: 100 }
    );
    readout.textContent = `${row.figma} → ${row.svg}
supported=${row.supported}
${row.notes}

sample export:
${JSON.stringify(sample, null, 2)}`;
  }
  type.addEventListener("change", render);
  render();
}

function mountFigmaRadialPaintDemo(canvas, toolbar, readout) {
  const mode = document.createElement("select");
  ["GRADIENT_RADIAL", "GRADIENT_ANGULAR"].forEach((v) => mode.append(new Option(v, v)));
  toolbar.append(el("label", "", "mode"), mode);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", "120");
  shape.setAttribute("y", "80");
  shape.setAttribute("width", "400");
  shape.setAttribute("height", "240");
  shape.setAttribute("stroke", "#1e293b");
  svg.append(defs, shape);

  function render() {
    const paint = {
      type: mode.value,
      gradientStops: [
        { position: 0, color: { r: 0.15, g: 0.39, b: 0.92, a: 1 } },
        { position: 1, color: { r: 0.98, g: 0.75, b: 0.14, a: 1 } }
      ]
    };
    if (mode.value === "GRADIENT_RADIAL") {
      const mapped = figmaRadialGradientPaintToSvg(paint, { gradientId: "rg" });
      defs.innerHTML = mapped.markup;
      shape.setAttribute("fill", mapped.fill);
      shape.removeAttribute("style");
      readout.textContent = mapped.markup;
    } else {
      const css = figmaAngularGradientToCss(paint);
      defs.innerHTML = "";
      shape.setAttribute("fill", "#e2e8f0");
      shape.setAttribute("style", css.background);
      readout.textContent = `${css.note}\n${css.background}`;
    }
  }
  mode.addEventListener("change", render);
  render();
}

function mountFigmaImagePaintDemo(canvas, toolbar, readout) {
  const mode = document.createElement("select");
  ["FILL", "TILE"].forEach((v) => mode.append(new Option(v, v)));
  toolbar.append(el("label", "", "scaleMode"), mode);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const rect = document.createElementNS(svgNs(), "rect");
  rect.setAttribute("x", "80");
  rect.setAttribute("y", "60");
  rect.setAttribute("width", "480");
  rect.setAttribute("height", "300");
  rect.setAttribute("stroke", "#334155");
  svg.append(defs, rect);
  const checker =
    '<rect width="20" height="20" fill="#e2e8f0"/><rect x="20" y="20" width="20" height="20" fill="#e2e8f0"/><rect x="20" width="20" height="20" fill="#cbd5e1"/><rect y="20" width="20" height="20" fill="#cbd5e1"/>';
  function render() {
    const mapped = figmaImagePaintToSvg(
      { type: "IMAGE", scaleMode: mode.value, imageRef: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${checker}</svg>`)}` },
      { patternId: "img" }
    );
    defs.innerHTML = mapped.markup;
    rect.setAttribute("fill", mapped.fill ?? "url(#img)");
    readout.textContent = mapped.markup;
  }
  mode.addEventListener("change", render);
  render();
}

function mountFigmaStrokeAlignExportDemo(canvas, toolbar, readout) {
  const align = document.createElement("select");
  ["CENTER", "INSIDE", "OUTSIDE"].forEach((v) => align.append(new Option(v, v)));
  toolbar.append(el("label", "", "align"), align);
  const pathD = "M 220 120 L 420 120 L 320 300 Z";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  const fill = document.createElementNS(svgNs(), "path");
  fill.setAttribute("d", pathD);
  fill.setAttribute("fill", "rgba(37,99,235,0.2)");
  const strokeLayer = document.createElementNS(svgNs(), "path");
  svg.append(defs, fill, strokeLayer);

  function render() {
    const mapped = figmaStrokeAlignToSvgMarkup({
      pathD,
      stroke: { weight: 8, align: align.value, color: { r: 0.1, g: 0.2, b: 0.9, a: 1 }, cap: "ROUND", join: "ROUND" },
      clipId: "align-clip"
    });
    defs.innerHTML = "";
    strokeLayer.removeAttribute("clip-path");
    if (mapped.defs) defs.innerHTML = mapped.defs;
    strokeLayer.setAttribute("d", pathD);
    Object.assign(strokeLayer.style, {});
    if (align.value === "INSIDE") {
      strokeLayer.setAttribute("fill", "none");
      strokeLayer.setAttribute("stroke", "#1d4ed8");
      strokeLayer.setAttribute("stroke-width", "16");
      strokeLayer.setAttribute("stroke-linejoin", "round");
      strokeLayer.setAttribute("clip-path", mapped.clipPathAttr);
      fill.setAttribute("fill", "#2563eb");
    } else {
      strokeLayer.setAttribute("fill", "none");
      strokeLayer.setAttribute("stroke", "#1d4ed8");
      strokeLayer.setAttribute("stroke-width", "8");
      strokeLayer.setAttribute("stroke-linejoin", "round");
      fill.setAttribute("fill", align.value === "OUTSIDE" ? "#93c5fd" : "#2563eb");
    }
    readout.textContent = `${mapped.align}\n${mapped.note ?? ""}\n\n${mapped.markup}`;
  }
  align.addEventListener("change", render);
  render();
}

function mountFigmaBlendOpacityDemo(canvas, toolbar, readout) {
  const blend = document.createElement("select");
  FIGMA_BLEND_MAP.slice(0, 8).forEach((row) => blend.append(new Option(row.figma, row.figma)));
  const opacity = range("opacity", 0.2, 1, 0.85, 0.05);
  toolbar.append(el("label", "", "blend"), blend, opacity.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const back = document.createElementNS(svgNs(), "rect");
  back.setAttribute("width", "640");
  back.setAttribute("height", "420");
  back.setAttribute("fill", "#e2e8f0");
  const a = document.createElementNS(svgNs(), "circle");
  a.setAttribute("cx", "260");
  a.setAttribute("cy", "210");
  a.setAttribute("r", "90");
  a.setAttribute("fill", "#2563eb");
  const b = document.createElementNS(svgNs(), "circle");
  b.setAttribute("cx", "380");
  b.setAttribute("cy", "210");
  b.setAttribute("r", "90");
  b.setAttribute("fill", "#f59e0b");
  svg.append(back, a, b);

  function render() {
    const comp = figmaLayerCompositingToSvg({ blendMode: blend.value, opacity: Number(opacity.input.value) });
    b.setAttribute("opacity", String(comp.opacity));
    b.setAttribute("style", `mix-blend-mode: ${comp["mix-blend-mode"]}`);
    readout.textContent = `figma ${blend.value} → mix-blend-mode: ${figmaBlendModeToSvg(blend.value)}
opacity=${comp.opacity}`;
  }
  [blend, opacity.input].forEach((n) => n.addEventListener("input", render));
  render();
}

function mountSvgMarkersDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  defs.innerHTML = buildMarkerMarkup({ id: "arrow" });
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", "M 80 300 C 200 80, 440 360, 560 120");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#2563eb");
  path.setAttribute("stroke-width", "4");
  path.setAttribute("marker-end", "url(#arrow)");
  svg.append(defs, path);
  readout.textContent = defs.innerHTML;
}

function mountSvgTextPathDemo(canvas, toolbar, readout) {
  const text = document.createElement("input");
  text.value = "SVG Geometry";
  toolbar.append(el("label", "", "label"), text);
  const pathD = "M 60 300 Q 200 60 360 300 T 580 180";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const guide = document.createElementNS(svgNs(), "path");
  guide.setAttribute("d", pathD);
  guide.setAttribute("fill", "none");
  guide.setAttribute("stroke", "#cbd5e1");
  guide.setAttribute("stroke-dasharray", "6 4");
  const layer = document.createElementNS(svgNs(), "g");
  svg.append(guide, layer);
  function render() {
    layer.innerHTML = buildTextPathMarkup({ pathD, text: text.value, pathId: "label-path" });
    readout.textContent = layer.innerHTML;
  }
  text.addEventListener("input", render);
  render();
}

function mountSvgPaintOrderDemo(canvas, toolbar, readout) {
  const order = document.createElement("select");
  ["fill stroke markers", "stroke fill markers"].forEach((v) => order.append(new Option(v, v)));
  toolbar.append(el("label", "", "paint-order"), order);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const defs = document.createElementNS(svgNs(), "defs");
  defs.innerHTML = buildTurbulenceFilterMarkup("warp", 0.04);
  const shape = document.createElementNS(svgNs(), "rect");
  shape.setAttribute("x", "140");
  shape.setAttribute("y", "100");
  shape.setAttribute("width", "360");
  shape.setAttribute("height", "200");
  shape.setAttribute("rx", "24");
  shape.setAttribute("fill", "#2563eb");
  shape.setAttribute("stroke", "#f59e0b");
  shape.setAttribute("stroke-width", "24");
  svg.append(defs, shape);
  function render() {
    const po = paintOrderAttributes(order.value);
    const lo = layerOpacityAttributes({ opacity: 0.9, fillOpacity: 0.85 });
    shape.setAttribute("paint-order", po["paint-order"]);
    shape.setAttribute("opacity", String(lo.opacity));
    shape.setAttribute("filter", order.value.startsWith("stroke") ? "" : "url(#warp)");
    readout.textContent = `paint-order=${po["paint-order"]}
filter: feTurbulence + feDisplacementMap (optional)

${buildTurbulenceFilterMarkup("warp", 0.04)}`;
  }
  order.addEventListener("change", render);
  render();
}

function mountArcFlattenUnifiedDemo(canvas, toolbar, readout) {
  const arcD = "M 80 300 A 200 120 0 0 1 560 300";
  const chordPts = [];
  const seg = parsePathD(arcD).find((s) => s.type === "A");
  for (let i = 0; i <= 24; i += 1) {
    const t = i / 24;
    chordPts.push({ x: seg.from.x + (seg.to.x - seg.from.x) * t, y: seg.from.y + (seg.to.y - seg.from.y) * t });
  }
  const accurate = flattenPathSegments(parsePathD(arcD), { stepsPerArc: 12 });
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const chord = document.createElementNS(svgNs(), "polyline");
  chord.setAttribute("fill", "none");
  chord.setAttribute("stroke", "#94a3b8");
  chord.setAttribute("stroke-dasharray", "4 4");
  chord.setAttribute("points", chordPts.map((p) => `${p.x},${p.y}`).join(" "));
  const acc = document.createElementNS(svgNs(), "polyline");
  acc.setAttribute("fill", "none");
  acc.setAttribute("stroke", "#2563eb");
  acc.setAttribute("stroke-width", "2");
  acc.setAttribute("points", accurate.map((p) => `${p.x},${p.y}`).join(" "));
  const src = document.createElementNS(svgNs(), "path");
  src.setAttribute("d", arcD);
  src.setAttribute("fill", "none");
  src.setAttribute("stroke", "#cbd5e1");
  svg.append(src, chord, acc);
  readout.textContent = `chord lerp (gray dashed) ${chordPts.length} pts — 구 flatten
arc→cubic sample (blue) ${accurate.length} pts — arc.js via flattenPathSegments
mid Y accurate≈${accurate[Math.floor(accurate.length / 2)].y.toFixed(1)}`;
}

function mountDemo(lesson, canvas, toolbar, readout) {
  switch (lesson.demo) {
    case "viewbox":
      mountViewBoxDemo(canvas, toolbar, readout);
      break;
    case "svg-transform":
      mountSvgTransformDemo(canvas, toolbar, readout);
      break;
    case "path-grammar":
      mountPathGrammarDemo(canvas, toolbar, readout);
      break;
    case "stroke-hit":
      mountStrokeHitDemo(canvas, toolbar, readout);
      break;
    case "stroke-style":
      mountStrokeStyleDemo(canvas, toolbar, readout);
      break;
    case "stroke-align":
      mountStrokeAlignDemo(canvas, toolbar, readout);
      break;
    case "path-hv":
      mountPathCommandDemo(canvas, toolbar, readout, "M 80 80 H 520 V 320 h -120 v -80 Z", "H / V");
      break;
    case "path-cubic":
      mountPathCubicDemo(canvas, toolbar, readout);
      break;
    case "path-quad":
      mountPathCommandDemo(canvas, toolbar, readout, "M 80 320 Q 200 40 360 320 T 560 120", "Q / T");
      break;
    case "path-smooth":
      mountPathCommandDemo(canvas, toolbar, readout, "M 60 300 C 120 60 200 360 260 120 S 420 40 580 300", "C / S");
      break;
    case "path-arc":
      mountPathCommandDemo(canvas, toolbar, readout, "M 80 300 A 120 80 0 0 1 560 120", "A");
      break;
    case "path-bbox":
      mountPathBboxDemo(canvas, toolbar, readout);
      break;
    case "miter-math":
      mountMiterMathDemo(canvas, toolbar, readout);
      break;
    case "fill-rule":
      mountFillRuleDemo(canvas, toolbar, readout);
      break;
    case "fill-hit":
      mountFillHitDemo(canvas, toolbar, readout);
      break;
    case "path-flatten":
      mountPathFlattenDemo(canvas, toolbar, readout);
      break;
    case "path-length":
      mountPathLengthDemo(canvas, toolbar, readout);
      break;
    case "path-point":
      mountPathLengthDemo(canvas, toolbar, readout);
      break;
    case "gradient-units":
      mountGradientUnitsDemo(canvas, toolbar, readout);
      break;
    case "clip-mask":
      mountClipMaskDemo(canvas, toolbar, readout);
      break;
    case "path-handles":
      mountPathHandlesDemo(canvas, toolbar, readout);
      break;
    case "handle-hit":
      mountHandleHitDemo(canvas, toolbar, readout);
      break;
    case "handle-drag":
      mountHandleDragDemo(canvas, toolbar, readout);
      break;
    case "path-editor":
      mountPathEditorDemo(canvas, toolbar, readout);
      break;
    case "winding-compare":
      mountWindingCompareDemo(canvas, toolbar, readout);
      break;
    case "compound-path":
      mountCompoundPathDemo(canvas, toolbar, readout);
      break;
    case "self-intersect":
      mountSelfIntersectDemo(canvas, toolbar, readout);
      break;
    case "path-boolean":
      mountPathBooleanDemo(canvas, toolbar, readout);
      break;
    case "hit-priority":
      mountHitPriorityDemo(canvas, toolbar, readout);
      break;
    case "scanline":
      mountScanlineDemo(canvas, toolbar, readout);
      break;
    case "figma-filter":
      mountFigmaFilterDemo(canvas, toolbar, readout);
      break;
    case "filter-chain":
      mountFilterChainDemo(canvas, toolbar, readout);
      break;
    case "filter-blur-merge":
      mountFilterBlurMergeDemo(canvas, toolbar, readout);
      break;
    case "filter-inner":
      mountFilterInnerDemo(canvas, toolbar, readout);
      break;
    case "filter-blur-types":
      mountFilterBlurTypesDemo(canvas, toolbar, readout);
      break;
    case "figma-effects-all":
      mountFigmaEffectsAllDemo(canvas, toolbar, readout);
      break;
    case "figma-vector-network":
      mountFigmaVectorNetworkDemo(canvas, toolbar, readout);
      break;
    case "figma-fill-stroke":
      mountFigmaFillStrokeDemo(canvas, toolbar, readout);
      break;
    case "figma-boolean":
      mountFigmaBooleanDemo(canvas, toolbar, readout);
      break;
    case "figma-clip-mask":
      mountFigmaClipMaskDemo(canvas, toolbar, readout);
      break;
    case "radial-gradient":
      mountRadialGradientDemo(canvas, toolbar, readout);
      break;
    case "pattern-tile":
      mountPatternTileDemo(canvas, toolbar, readout);
      break;
    case "gradient-spread":
      mountGradientSpreadDemo(canvas, toolbar, readout);
      break;
    case "icon-grid":
      mountIconGridDemo(canvas, toolbar, readout);
      break;
    case "icon-fill-stroke":
      mountIconFillStrokeDemo(canvas, toolbar, readout);
      break;
    case "icon-sprite":
      mountIconSpriteDemo(canvas, toolbar, readout);
      break;
    case "icon-simplify":
      mountIconSimplifyDemo(canvas, toolbar, readout);
      break;
    case "svg-current-color":
      mountSvgCurrentColorDemo(canvas, toolbar, readout);
      break;
    case "svg-sprite-uri":
      mountSvgSpriteUriDemo(canvas, toolbar, readout);
      break;
    case "svg-optimize":
      mountSvgOptimizeDemo(canvas, toolbar, readout);
      break;
    case "engine-dash-offset":
      mountEngineDashOffsetDemo(canvas, toolbar, readout);
      break;
    case "engine-adaptive-flatten":
      mountEngineAdaptiveFlattenDemo(canvas, toolbar, readout);
      break;
    case "engine-arc-cubic":
      mountEngineArcCubicDemo(canvas, toolbar, readout);
      break;
    case "engine-multi-subpath":
      mountEngineMultiSubpathDemo(canvas, toolbar, readout);
      break;
    case "primer-capability-map":
      mountPrimerCapabilityMapDemo(canvas, toolbar, readout);
      break;
    case "primer-coordinate-stack":
      mountPrimerCoordinateStackDemo(canvas, toolbar, readout);
      break;
    case "figma-paint-gap":
      mountFigmaPaintGapDemo(canvas, toolbar, readout);
      break;
    case "figma-radial-paint":
      mountFigmaRadialPaintDemo(canvas, toolbar, readout);
      break;
    case "figma-image-paint":
      mountFigmaImagePaintDemo(canvas, toolbar, readout);
      break;
    case "figma-stroke-align-export":
      mountFigmaStrokeAlignExportDemo(canvas, toolbar, readout);
      break;
    case "figma-blend-opacity":
      mountFigmaBlendOpacityDemo(canvas, toolbar, readout);
      break;
    case "svg-markers":
      mountSvgMarkersDemo(canvas, toolbar, readout);
      break;
    case "svg-text-path":
      mountSvgTextPathDemo(canvas, toolbar, readout);
      break;
    case "svg-paint-order":
      mountSvgPaintOrderDemo(canvas, toolbar, readout);
      break;
    case "arc-flatten-unified":
      mountArcFlattenUnifiedDemo(canvas, toolbar, readout);
      break;
    default:
      readout.textContent = `Demo "${lesson.demo}" is not implemented yet.`;
  }
}

export function mountLesson(id, target = document.body) {
  const lesson = getLesson(id);
  const embedded = new URLSearchParams(window.location.search).get("embed") === "1";
  document.title = `${lesson.id}. ${lesson.title} - SVG Graphics Geometry`;

  if (embedded) {
    const stage = el("section", "lesson-stage embed-stage");
    const toolbar = el("div", "toolbar");
    const canvas = el("div", "stage-canvas");
    const readout = el("pre", "readout");
    stage.append(toolbar, canvas, readout);
    target.replaceChildren(stage);
    mountDemo(lesson, canvas, toolbar, readout);
    return;
  }

  const shell = el("main", "lesson-shell");
  const sidebar = el("aside", "lesson-sidebar");
  sidebar.append(
    el("p", "lesson-kicker", `Lesson ${lesson.id}`),
    el("h1", "", lesson.title),
    el("p", "lesson-goal", lesson.goal)
  );
  const list = el("ul", "lesson-list");
  lesson.takeaways.forEach((item) => list.append(el("li", "", item)));
  sidebar.append(list);

  const stage = el("section", "lesson-stage");
  const toolbar = el("div", "toolbar");
  const canvas = el("div", "stage-canvas");
  const readout = el("pre", "readout");
  stage.append(toolbar, canvas, readout);
  shell.append(sidebar, stage);
  target.replaceChildren(shell);
  mountDemo(lesson, canvas, toolbar, readout);
}
