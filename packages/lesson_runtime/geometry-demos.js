import {
  CIRCLE_CUBIC_KAPPA,
  SVG_MATH_TOPIC_MAP,
  applyAffineMatrix,
  applySvgMatrix,
  closestPointOnCubic,
  convolve1D,
  cubicBezierPoint,
  cubicCurvatureAt,
  cubicCubicIntersections,
  cubicFlatnessError,
  cubicNormalAt,
  decomposeAffineMatrix,
  earClipTriangulate,
  triangulatePolygonWithHoles,
  elevateQuadraticToCubic,
  evenoddParityFromRayCast,
  fanTriangulateConvex,
  gaussianKernel1D,
  invertAffineMatrix,
  lineCubicIntersections,
  lineSegmentIntersection,
  offsetPointOnCubic,
  offsetPolyline,
  parsePathD,
  pathDFromSegments,
  quadraticBezierPoint,
  parseSvgMatrix,
  porterDuffSourceOver,
  reflectControlForSmoothContinuation,
  shoelaceArea,
  subdivideCubicBezier,
  subdivideQuadraticBezier,
  svgArcCenterParameters,
  transformPathSegments
} from "../svg-matrix-core/src/index.js";

function svgNs() {
  return "http://www.w3.org/2000/svg";
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function range(label, min, max, value, step = 1) {
  const wrapper = el("label", "range");
  wrapper.append(document.createTextNode(label));
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  wrapper.append(input);
  return { wrapper, input };
}

function appendSvgPath(svg, d, stroke, width = 3) {
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", stroke);
  path.setAttribute("stroke-width", String(width));
  svg.append(path);
  return path;
}

export function mountSubdivideDemo(canvas, toolbar, readout) {
  const depth = range("split depth", 0, 4, 2);
  toolbar.append(depth.wrapper);
  const p0 = { x: 60, y: 300 };
  const p1 = { x: 120, y: 60 };
  const p2 = { x: 520, y: 360 };
  const p3 = { x: 580, y: 120 };
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);

  function curvesAt(level) {
    let segments = [{ p0, p1, p2, p3 }];
    for (let i = 0; i < level; i += 1) {
      segments = segments.flatMap((s) => {
        const { left, right } = subdivideCubicBezier(s.p0, s.p1, s.p2, s.p3);
        return [
          { p0: left.p0, p1: left.p1, p2: left.p2, p3: left.p3 },
          { p0: right.p0, p1: right.p1, p2: right.p2, p3: right.p3 }
        ];
      });
    }
    return segments;
  }

  function render() {
    svg.replaceChildren();
    const level = Number(depth.input.value);
    const colors = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];
    curvesAt(level).forEach((s, i) => {
      const d = `M ${s.p0.x} ${s.p0.y} C ${s.p1.x} ${s.p1.y} ${s.p2.x} ${s.p2.y} ${s.p3.x} ${s.p3.y}`;
      appendSvgPath(svg, d, colors[i % colors.length], 2);
    });
    readout.textContent = `de Casteljau depth=${level} → ${2 ** level} sub-curves\nmidpoint on curve = left.p3 = right.p0`;
  }
  depth.input.addEventListener("input", render);
  render();
}

export function mountFlatnessDemo(canvas, toolbar, readout) {
  const tol = range("tolerance", 0, 20, 4, 0.5);
  toolbar.append(tol.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const p0 = { x: 80, y: 320 };
  const p1 = { x: 160, y: 40 };
  const p2 = { x: 480, y: 360 };
  const p3 = { x: 560, y: 80 };

  function render() {
    svg.replaceChildren();
    const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
    appendSvgPath(svg, d, "#94a3b8", 2);
    const err = cubicFlatnessError(p0, p1, p2, p3);
    const chord = document.createElementNS(svgNs(), "line");
    chord.setAttribute("x1", String(p0.x));
    chord.setAttribute("y1", String(p0.y));
    chord.setAttribute("x2", String(p3.x));
    chord.setAttribute("y2", String(p3.y));
    chord.setAttribute("stroke", "#cbd5e1");
    chord.setAttribute("stroke-dasharray", "6 4");
    svg.append(chord);
    readout.textContent = `cubicFlatnessError (mid→chord) = ${err.toFixed(2)}px\ntolerance=${tol.input.value} → adaptive flatten splits while err > tol`;
  }
  tol.input.addEventListener("input", render);
  render();
}

export function mountCurvatureDemo(canvas, toolbar, readout) {
  const tSlider = range("t", 0, 100, 50);
  toolbar.append(tSlider.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const p0 = { x: 60, y: 300 };
  const p1 = { x: 140, y: 40 };
  const p2 = { x: 500, y: 380 };
  const p3 = { x: 580, y: 100 };
  const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;

  function render() {
    svg.replaceChildren();
    appendSvgPath(svg, d, "#2563eb");
    const t = Number(tSlider.input.value) / 100;
    const pt = cubicBezierPoint(p0, p1, p2, p3, t);
    const n = cubicNormalAt(p0, p1, p2, p3, t, 1);
    const k = cubicCurvatureAt(p0, p1, p2, p3, t);
    const dot = document.createElementNS(svgNs(), "circle");
    dot.setAttribute("cx", String(pt.x));
    dot.setAttribute("cy", String(pt.y));
    dot.setAttribute("r", "6");
    dot.setAttribute("fill", "#f59e0b");
    const line = document.createElementNS(svgNs(), "line");
    line.setAttribute("x1", String(pt.x));
    line.setAttribute("y1", String(pt.y));
    line.setAttribute("x2", String(pt.x + n.x * 60));
    line.setAttribute("y2", String(pt.y + n.y * 60));
    line.setAttribute("stroke", "#16a34a");
    line.setAttribute("stroke-width", "2");
    svg.append(dot, line);
    readout.textContent = `κ=${k.toFixed(5)}  normal=(${n.x.toFixed(2)}, ${n.y.toFixed(2)})\noffset·textPath·stroke expansion use n̂`;
  }
  tSlider.input.addEventListener("input", render);
  render();
}

export function mountArcCenterDemo(canvas, toolbar, readout) {
  const d = "M 80 300 A 120 80 0 0 1 560 120";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  appendSvgPath(svg, d, "#2563eb");
  const seg = parsePathD(d).find((s) => s.type === "A");
  const arc = svgArcCenterParameters(seg);
  const center = document.createElementNS(svgNs(), "circle");
  center.setAttribute("cx", String(arc.cx));
  center.setAttribute("cy", String(arc.cy));
  center.setAttribute("r", "4");
  center.setAttribute("fill", "#ef4444");
  const rx = document.createElementNS(svgNs(), "ellipse");
  rx.setAttribute("cx", String(arc.cx));
  rx.setAttribute("cy", String(arc.cy));
  rx.setAttribute("rx", String(arc.rx));
  rx.setAttribute("ry", String(arc.ry));
  rx.setAttribute("fill", "none");
  rx.setAttribute("stroke", "#94a3b8");
  rx.setAttribute("stroke-dasharray", "4 4");
  svg.append(rx, center);
  readout.textContent = `svgArcCenterParameters\n(cx,cy)=(${arc.cx.toFixed(1)}, ${arc.cy.toFixed(1)}) rx=${arc.rx.toFixed(1)} ry=${arc.ry.toFixed(1)}\nΔθ=${arc.deltaAngle.toFixed(3)} rad`;
}

export function mountSmoothReflectDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const a = { x: 80, y: 280 };
  const c1 = { x: 160, y: 80 };
  const anchor = { x: 280, y: 200 };
  const reflected = reflectControlForSmoothContinuation(anchor, c1);
  appendSvgPath(svg, `M ${a.x} ${a.y} C ${c1.x} ${c1.y} ${reflected.x} ${reflected.y} ${anchor.x} ${anchor.y}`, "#2563eb");
  for (const [p, color] of [
    [a, "#64748b"],
    [c1, "#94a3b8"],
    [reflected, "#f59e0b"],
    [anchor, "#1d4ed8"]
  ]) {
    const dot = document.createElementNS(svgNs(), "circle");
    dot.setAttribute("cx", String(p.x));
    dot.setAttribute("cy", String(p.y));
    dot.setAttribute("r", "5");
    dot.setAttribute("fill", color);
    svg.append(dot);
  }
  readout.textContent = `reflectControlForSmoothContinuation(anchor, cpPrev)\n= 2·anchor − cpPrev → G¹ tangent match for S/T`;
}

export function mountShoelaceDemo(canvas, toolbar, readout) {
  const poly = [
    { x: 180, y: 80 },
    { x: 460, y: 100 },
    { x: 420, y: 320 },
    { x: 200, y: 300 }
  ];
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const pl = document.createElementNS(svgNs(), "polygon");
  pl.setAttribute("points", poly.map((p) => `${p.x},${p.y}`).join(" "));
  pl.setAttribute("fill", "rgba(37,99,235,0.15)");
  pl.setAttribute("stroke", "#1d4ed8");
  pl.setAttribute("stroke-width", "2");
  svg.append(pl);
  const area = shoelaceArea(poly);
  readout.textContent = `shoelaceArea = ${area.toFixed(1)} (signed)\n|area| = ${Math.abs(area).toFixed(1)} — winding 방향에 따라 부호`;
}

export function mountSegmentIntersectDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const a0 = { x: 80, y: 80 };
  const a1 = { x: 560, y: 340 };
  const b0 = { x: 80, y: 340 };
  const b1 = { x: 560, y: 80 };
  for (const [p0, p1, color] of [
    [a0, a1, "#2563eb"],
    [b0, b1, "#16a34a"]
  ]) {
    const ln = document.createElementNS(svgNs(), "line");
    ln.setAttribute("x1", String(p0.x));
    ln.setAttribute("y1", String(p0.y));
    ln.setAttribute("x2", String(p1.x));
    ln.setAttribute("y2", String(p1.y));
    ln.setAttribute("stroke", color);
    ln.setAttribute("stroke-width", "3");
    svg.append(ln);
  }
  const hit = lineSegmentIntersection(a0, a1, b0, b1);
  if (hit) {
    const dot = document.createElementNS(svgNs(), "circle");
    dot.setAttribute("cx", String(hit.point.x));
    dot.setAttribute("cy", String(hit.point.y));
    dot.setAttribute("r", "7");
    dot.setAttribute("fill", "#f59e0b");
    svg.append(dot);
  }
  readout.textContent = hit
    ? `lineSegmentIntersection → (${hit.point.x.toFixed(1)}, ${hit.point.y.toFixed(1)}) t=${hit.t.toFixed(3)} u=${hit.u.toFixed(3)}`
    : "parallel — no intersection";
}

export function mountLineCubicIntersectDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const p0 = { x: 60, y: 320 };
  const p1 = { x: 180, y: 40 };
  const p2 = { x: 460, y: 360 };
  const p3 = { x: 580, y: 80 };
  appendSvgPath(svg, `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`, "#2563eb");
  const l0 = { x: 300, y: 0 };
  const l1 = { x: 300, y: 420 };
  const ln = document.createElementNS(svgNs(), "line");
  ln.setAttribute("x1", String(l0.x));
  ln.setAttribute("y1", String(l0.y));
  ln.setAttribute("x2", String(l1.x));
  ln.setAttribute("y2", String(l1.y));
  ln.setAttribute("stroke", "#16a34a");
  ln.setAttribute("stroke-width", "2");
  ln.setAttribute("stroke-dasharray", "6 4");
  svg.append(ln);
  const hits = lineCubicIntersections(p0, p1, p2, p3, l0, l1);
  hits.forEach((h) => {
    const dot = document.createElementNS(svgNs(), "circle");
    dot.setAttribute("cx", String(h.point.x));
    dot.setAttribute("cy", String(h.point.y));
    dot.setAttribute("r", "6");
    dot.setAttribute("fill", "#f59e0b");
    svg.append(dot);
  });
  readout.textContent = `lineCubicIntersections → ${hits.length} hit(s)\n${hits.map((h) => `t=${h.t.toFixed(3)}`).join(", ")}`;
}

export function mountClosestPointDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const p0 = { x: 60, y: 300 };
  const p1 = { x: 140, y: 60 };
  const p2 = { x: 500, y: 360 };
  const p3 = { x: 580, y: 120 };
  appendSvgPath(svg, `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`, "#94a3b8", 2);
  const query = { x: 320, y: 200 };
  const result = closestPointOnCubic(query, p0, p1, p2, p3);
  const qDot = document.createElementNS(svgNs(), "circle");
  qDot.setAttribute("cx", String(query.x));
  qDot.setAttribute("cy", String(query.y));
  qDot.setAttribute("r", "5");
  qDot.setAttribute("fill", "#ef4444");
  const pDot = document.createElementNS(svgNs(), "circle");
  pDot.setAttribute("cx", String(result.point.x));
  pDot.setAttribute("cy", String(result.point.y));
  pDot.setAttribute("r", "6");
  pDot.setAttribute("fill", "#2563eb");
  const link = document.createElementNS(svgNs(), "line");
  link.setAttribute("x1", String(query.x));
  link.setAttribute("y1", String(query.y));
  link.setAttribute("x2", String(result.point.x));
  link.setAttribute("y2", String(result.point.y));
  link.setAttribute("stroke", "#f59e0b");
  svg.append(qDot, pDot, link);
  readout.textContent = `closestPointOnCubic\ndistance=${result.distance.toFixed(2)} t=${result.t.toFixed(4)}`;
}

export function mountOffsetNormalDemo(canvas, toolbar, readout) {
  const dist = range("offset", -40, 40, 16);
  toolbar.append(dist.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const p0 = { x: 80, y: 300 };
  const p1 = { x: 200, y: 60 };
  const p2 = { x: 440, y: 340 };
  const p3 = { x: 560, y: 100 };
  const samples = 24;

  function render() {
    svg.replaceChildren();
    appendSvgPath(svg, `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`, "#cbd5e1", 2);
    const d = Number(dist.input.value);
    const pts = [];
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      pts.push(offsetPointOnCubic(p0, p1, p2, p3, t, d));
    }
    const poly = document.createElementNS(svgNs(), "polyline");
    poly.setAttribute("points", pts.map((p) => `${p.x},${p.y}`).join(" "));
    poly.setAttribute("fill", "none");
    poly.setAttribute("stroke", "#2563eb");
    poly.setAttribute("stroke-width", "3");
    svg.append(poly);
    readout.textContent = `offsetPointOnCubic(t, d) sampled — parallel curve\noffsetPolyline on flatten: engine.js`;
  }
  dist.input.addEventListener("input", render);
  render();
}

export function mountOffsetCuspDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const points = [
    { x: 100, y: 200 },
    { x: 200, y: 80 },
    { x: 320, y: 320 },
    { x: 440, y: 120 },
    { x: 540, y: 280 }
  ];
  const pl = document.createElementNS(svgNs(), "polyline");
  pl.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
  pl.setAttribute("fill", "none");
  pl.setAttribute("stroke", "#64748b");
  pl.setAttribute("stroke-width", "2");
  const off = offsetPolyline(points, 28, false);
  const offPl = document.createElementNS(svgNs(), "polyline");
  offPl.setAttribute("points", off.map((p) => `${p.x},${p.y}`).join(" "));
  offPl.setAttribute("fill", "none");
  offPl.setAttribute("stroke", "#2563eb");
  offPl.setAttribute("stroke-width", "3");
  svg.append(pl, offPl);
  readout.textContent = `acute corner → offset polyline self-intersects (cusp)\nvariable width / miter limit 같은 완화 필요`;
}

export function mountAffineDecomposeDemo(canvas, toolbar, readout) {
  const rot = range("rotate°", -180, 180, 25);
  const sx = range("scaleX", 50, 200, 100);
  toolbar.append(rot.wrapper, sx.wrapper);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const rect = document.createElementNS(svgNs(), "rect");
  rect.setAttribute("x", "240");
  rect.setAttribute("y", "140");
  rect.setAttribute("width", "160");
  rect.setAttribute("height", "100");
  rect.setAttribute("fill", "rgba(37,99,235,0.2)");
  rect.setAttribute("stroke", "#1d4ed8");
  svg.append(rect);

  function render() {
    const rad = (Number(rot.input.value) * Math.PI) / 180;
    const sc = Number(sx.input.value) / 100;
    const matrix = { a: Math.cos(rad) * sc, b: Math.sin(rad) * sc, c: -Math.sin(rad), d: Math.cos(rad), e: 80, f: 40 };
    const parts = decomposeAffineMatrix(matrix);
    const inv = invertAffineMatrix(matrix);
    rect.setAttribute("transform", `matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`);
    readout.textContent = `decomposeAffineMatrix → rotate=${((parts.rotation * 180) / Math.PI).toFixed(1)}° scaleX=${parts.scaleX.toFixed(2)}\ninvertAffineMatrix · e=${inv.e.toFixed(1)} f=${inv.f.toFixed(1)}`;
  }
  rot.input.addEventListener("input", render);
  sx.input.addEventListener("input", render);
  render();
}

export function mountTransformPathDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const d = "M 120 280 C 200 80 440 320 520 120";
  const matrix = parseSvgMatrix("matrix(1.2 0.1 -0.1 1.1 40 20)");
  appendSvgPath(svg, d, "#94a3b8", 2);
  const segs = transformPathSegments(parsePathD(d), matrix);
  appendSvgPath(svg, pathDFromSegments(segs), "#2563eb");
  readout.textContent = `transformPathSegments — bake matrix into coordinates\nvs <g transform> leaves d in local space`;
}

export function mountCircleCubicDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  canvas.append(svg);
  const k = CIRCLE_CUBIC_KAPPA;
  appendSvgPath(svg, `M 100 0 C 100 ${100 * k} ${100 * k} 100 0 100`, "#2563eb", 3);
  const circle = document.createElementNS(svgNs(), "circle");
  circle.setAttribute("cx", "100");
  circle.setAttribute("cy", "100");
  circle.setAttribute("r", "100");
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", "#94a3b8");
  circle.setAttribute("stroke-dasharray", "4 4");
  svg.append(circle);
  readout.textContent = `CIRCLE_CUBIC_KAPPA = 4(√2−1)/3 ≈ ${k.toFixed(6)}\nquarter circle ≈ one cubic — full circle uses 4×C or arc A`;
}

export function mountRationalArcDemo(canvas, toolbar, readout) {
  readout.textContent = `Exact circle in SVG: <circle> or arc A (elliptical)\nRational quadratic (weights) gives exact circles but is not in path grammar — see webgl-matrix for NURBS`;
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 200");
  canvas.append(svg);
  appendSvgPath(svg, "M 80 100 A 80 80 0 0 1 240 100", "#2563eb", 3);
  appendSvgPath(svg, `M 320 20 C 320 ${20 + 80 * CIRCLE_CUBIC_KAPPA} ${400 - 80 * CIRCLE_CUBIC_KAPPA} 100 400 100`, "#f59e0b", 2);
}

export function mountCurveCurveIntersectDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const a0 = { x: 40, y: 360 };
  const a1 = { x: 200, y: 40 };
  const a2 = { x: 440, y: 380 };
  const a3 = { x: 600, y: 80 };
  const b0 = { x: 40, y: 40 };
  const b1 = { x: 220, y: 380 };
  const b2 = { x: 420, y: 40 };
  const b3 = { x: 600, y: 360 };
  appendSvgPath(svg, `M ${a0.x} ${a0.y} C ${a1.x} ${a1.y} ${a2.x} ${a2.y} ${a3.x} ${a3.y}`, "#2563eb");
  appendSvgPath(svg, `M ${b0.x} ${b0.y} C ${b1.x} ${b1.y} ${b2.x} ${b2.y} ${b3.x} ${b3.y}`, "#16a34a");
  const hits = cubicCubicIntersections(a0, a1, a2, a3, b0, b1, b2, b3);
  hits.forEach((h) => {
    const dot = document.createElementNS(svgNs(), "circle");
    dot.setAttribute("cx", String(h.point.x));
    dot.setAttribute("cy", String(h.point.y));
    dot.setAttribute("r", "7");
    dot.setAttribute("fill", "#f59e0b");
    svg.append(dot);
  });
  readout.textContent = `cubicCubicIntersections → ${hits.length} hit(s)\nsubdivide + flat chord test (see also 075 line∩cubic)`;
}

export function mountTriangulateDemo(canvas, toolbar, readout) {
  const mode = document.createElement("select");
  [["fan", "convex fan"], ["ear", "ear clipping"]].forEach(([v, l]) => mode.append(new Option(l, v)));
  toolbar.append(el("label", "", "mode"), mode);

  const convex = [
    { x: 200, y: 60 },
    { x: 480, y: 100 },
    { x: 420, y: 340 },
    { x: 240, y: 300 }
  ];
  const concave = [
    { x: 180, y: 80 },
    { x: 460, y: 80 },
    { x: 460, y: 160 },
    { x: 280, y: 160 },
    { x: 280, y: 340 },
    { x: 180, y: 340 }
  ];
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);

  function render() {
    const poly = mode.value === "ear" ? concave : convex;
    const tris = mode.value === "ear" ? earClipTriangulate(poly) : fanTriangulateConvex(poly);
    svg.replaceChildren();
    tris.forEach((tri, i) => {
      const pl = document.createElementNS(svgNs(), "polygon");
      pl.setAttribute("points", tri.map((p) => `${p.x},${p.y}`).join(" "));
      pl.setAttribute("fill", `rgba(37,99,235,${0.1 + (i % 5) * 0.06})`);
      pl.setAttribute("stroke", "#1d4ed8");
      pl.setAttribute("stroke-width", "1");
      svg.append(pl);
    });
    readout.textContent =
      mode.value === "ear"
        ? `earClipTriangulate — ${tris.length} triangles (L-shaped concave)`
        : `fanTriangulateConvex — ${tris.length} triangles`;
  }
  mode.addEventListener("change", render);
  render();
}

export function mountTriangulateHolesDemo(canvas, toolbar, readout) {
  const outer = [
    { x: 120, y: 40 },
    { x: 520, y: 40 },
    { x: 520, y: 360 },
    { x: 120, y: 360 }
  ];
  const hole = [
    { x: 220, y: 140 },
    { x: 420, y: 140 },
    { x: 420, y: 260 },
    { x: 220, y: 260 }
  ];
  const { triangles, mergedRing } = triangulatePolygonWithHoles(outer, [hole]);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  triangles.forEach((tri, i) => {
    const pl = document.createElementNS(svgNs(), "polygon");
    pl.setAttribute("points", tri.map((p) => `${p.x},${p.y}`).join(" "));
    pl.setAttribute("fill", `rgba(37,99,235,${0.12 + (i % 4) * 0.05})`);
    pl.setAttribute("stroke", "#93c5fd");
    pl.setAttribute("stroke-width", "1");
    svg.append(pl);
  });
  const outline = document.createElementNS(svgNs(), "polygon");
  outline.setAttribute("points", outer.map((p) => `${p.x},${p.y}`).join(" "));
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "#1d4ed8");
  outline.setAttribute("stroke-width", "2");
  const holeOutline = document.createElementNS(svgNs(), "polygon");
  holeOutline.setAttribute("points", hole.map((p) => `${p.x},${p.y}`).join(" "));
  holeOutline.setAttribute("fill", "none");
  holeOutline.setAttribute("stroke", "#f59e0b");
  holeOutline.setAttribute("stroke-width", "2");
  holeOutline.setAttribute("stroke-dasharray", "6 4");
  svg.append(outline, holeOutline);
  readout.textContent = `triangulatePolygonWithHoles → ${triangles.length} triangles\nbridge merged ring vertices: ${mergedRing.length}`;
}

export function mountEvenoddPixelDemo(canvas, toolbar, readout) {
  const bow = [
    { x: 200, y: 120 },
    { x: 440, y: 120 },
    { x: 440, y: 300 },
    { x: 200, y: 300 }
  ];
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  canvas.append(svg);
  const pl = document.createElementNS(svgNs(), "polygon");
  pl.setAttribute("points", `${bow[0].x},${bow[0].y} ${bow[1].x},${bow[1].y} ${bow[2].x},${bow[2].y} ${bow[3].x},${bow[3].y} ${bow[0].x},${bow[0].y}`);
  pl.setAttribute("fill", "rgba(37,99,235,0.2)");
  pl.setAttribute("stroke", "#1d4ed8");
  svg.append(pl);
  const test = { x: 320, y: 210 };
  const inside = evenoddParityFromRayCast(test, bow);
  const dot = document.createElementNS(svgNs(), "circle");
  dot.setAttribute("cx", String(test.x));
  dot.setAttribute("cy", String(test.y));
  dot.setAttribute("r", "6");
  dot.setAttribute("fill", inside ? "#16a34a" : "#ef4444");
  svg.append(dot);
  readout.textContent = `evenoddParityFromRayCast → ${inside ? "inside" : "outside"} center lobe\nscanline render flips parity each edge crossing`;
}

export function mountGaussianBlurDemo(canvas, toolbar, readout) {
  const sigma = range("σ", 1, 8, 3, 0.5);
  toolbar.append(sigma.wrapper);
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 320;
  canvas2d.height = 80;
  canvas.append(canvas2d);

  function render() {
    const signal = Array.from({ length: 64 }, (_, i) => (i > 28 && i < 36 ? 1 : 0));
    const kernel = gaussianKernel1D(Number(sigma.input.value));
    const blurred = convolve1D(signal, kernel);
    const ctx = canvas2d.getContext("2d");
    ctx.clearRect(0, 0, 320, 80);
    ctx.fillStyle = "#2563eb";
    blurred.forEach((v, i) => {
      ctx.fillRect(i * 5, 80 - v * 70, 4, v * 70);
    });
    readout.textContent = `gaussianKernel1D(σ) → separable blur\nfeGaussianBlur stdDeviation ≈ σ (SVG filter)`;
  }
  sigma.input.addEventListener("input", render);
  render();
}

export function mountPorterDuffDemo(canvas, toolbar, readout) {
  const alpha = range("source α", 0, 100, 70);
  toolbar.append(alpha.wrapper);
  const box = el("div", "");
  box.style.width = "200px";
  box.style.height = "120px";
  box.style.background = "#22c55e";
  box.style.position = "relative";
  const src = el("div", "");
  src.style.position = "absolute";
  src.style.inset = "20px";
  src.style.background = `rgba(239,68,68,${Number(alpha.input.value) / 100})`;
  box.append(src);
  canvas.append(box);

  function render() {
    const a = Number(alpha.input.value) / 100;
    src.style.background = `rgba(239,68,68,${a})`;
    const out = porterDuffSourceOver({ r: 0.94, g: 0.27, b: 0.27, a }, { r: 0.13, g: 0.77, b: 0.37, a: 1 });
    readout.textContent = `porterDuffSourceOver — source over backdrop\nout.a=${out.a.toFixed(3)} premultiply before GPU`;
  }
  alpha.input.addEventListener("input", render);
  render();
}

export function mountDegreeElevateDemo(canvas, toolbar, readout) {
  const p0 = { x: 80, y: 140 };
  const p1 = { x: 200, y: 30 };
  const p2 = { x: 520, y: 140 };
  const cubic = elevateQuadraticToCubic(p0, p1, p2);
  const qPath = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;
  const cPath = `M ${cubic.p0.x} ${cubic.p0.y} C ${cubic.p1.x} ${cubic.p1.y} ${cubic.p2.x} ${cubic.p2.y} ${cubic.p3.x} ${cubic.p3.y}`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 640 200");
  const q = document.createElementNS(svg.namespaceURI, "path");
  q.setAttribute("d", qPath);
  q.setAttribute("fill", "none");
  q.setAttribute("stroke", "#f59e0b");
  q.setAttribute("stroke-width", "3");
  q.setAttribute("stroke-dasharray", "8 4");
  const c = document.createElementNS(svg.namespaceURI, "path");
  c.setAttribute("d", cPath);
  c.setAttribute("fill", "none");
  c.setAttribute("stroke", "#2563eb");
  c.setAttribute("stroke-width", "2");
  const cp1 = document.createElementNS(svg.namespaceURI, "circle");
  cp1.setAttribute("cx", String(cubic.p1.x));
  cp1.setAttribute("cy", String(cubic.p1.y));
  cp1.setAttribute("r", "5");
  cp1.setAttribute("fill", "#93c5fd");
  const cp2 = document.createElementNS(svg.namespaceURI, "circle");
  cp2.setAttribute("cx", String(cubic.p2.x));
  cp2.setAttribute("cy", String(cubic.p2.y));
  cp2.setAttribute("r", "5");
  cp2.setAttribute("fill", "#93c5fd");
  svg.append(q, c, cp1, cp2);
  canvas.append(svg);
  let maxErr = 0;
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const qp = cubicBezierPoint(p0, p1, p2, t);
    const cp = cubicBezierPoint(cubic.p0, cubic.p1, cubic.p2, cubic.p3, t);
    maxErr = Math.max(maxErr, Math.hypot(qp.x - cp.x, qp.y - cp.y));
  }
  readout.textContent = `elevateQuadraticToCubic — Q(주황)와 C(파랑) 최대 오차 ${maxErr.toExponential(2)}\ncontrol points p1·p2 표시`;
}

export function mountMathTopicMapDemo(canvas, toolbar, readout) {
  const wrap = el("div", "");
  wrap.style.fontFamily = "ui-monospace, monospace";
  wrap.style.fontSize = "12px";
  wrap.innerHTML = `<pre>${SVG_MATH_TOPIC_MAP.map((r) => `${r.lesson} ${r.topic.padEnd(28)} ${r.part}`).join("\n")}</pre>`;
  canvas.append(wrap);
  readout.textContent = `${SVG_MATH_TOPIC_MAP.length} math topics — Parts 15–22 (lessons 068–087)`;
}

export const GEOMETRY_DEMO_MOUNTERS = {
  "geom-subdivide": mountSubdivideDemo,
  "geom-flatness": mountFlatnessDemo,
  "geom-curvature": mountCurvatureDemo,
  "geom-arc-center": mountArcCenterDemo,
  "geom-smooth": mountSmoothReflectDemo,
  "geom-shoelace": mountShoelaceDemo,
  "geom-segment-ix": mountSegmentIntersectDemo,
  "geom-line-cubic-ix": mountLineCubicIntersectDemo,
  "geom-curve-curve-ix": mountCurveCurveIntersectDemo,
  "geom-closest": mountClosestPointDemo,
  "geom-offset-normal": mountOffsetNormalDemo,
  "geom-offset-cusp": mountOffsetCuspDemo,
  "geom-affine": mountAffineDecomposeDemo,
  "geom-transform-path": mountTransformPathDemo,
  "geom-circle-cubic": mountCircleCubicDemo,
  "geom-rational-arc": mountRationalArcDemo,
  "geom-triangulate": mountTriangulateDemo,
  "geom-triangulate-holes": mountTriangulateHolesDemo,
  "geom-evenodd-pixel": mountEvenoddPixelDemo,
  "geom-gaussian": mountGaussianBlurDemo,
  "geom-porter-duff": mountPorterDuffDemo,
  "geom-math-map": mountMathTopicMapDemo,
  "geom-degree-elevate": mountDegreeElevateDemo
};
