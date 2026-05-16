import {
  buildAnimateMarkup,
  buildAnimateMotionMarkup,
  buildAnimateTransformMarkup,
  buildOffsetPathMotionCss,
  morphPathDLinear,
  parsePathD,
  pathLength,
  sampleMotionAlongPath,
  strokeDashDrawKeyframes
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

export function mountSmilAnimateDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 200");
  canvas.append(svg);
  const rect = document.createElementNS(svgNs(), "rect");
  rect.setAttribute("x", "80");
  rect.setAttribute("y", "60");
  rect.setAttribute("width", "120");
  rect.setAttribute("height", "80");
  rect.setAttribute("fill", "#2563eb");
  rect.setAttribute("opacity", "0.2");
  rect.innerHTML = buildAnimateMarkup({ attributeName: "opacity", from: 0.2, to: 1, dur: "2s" });
  svg.append(rect);
  readout.textContent = `SMIL <animate attributeName="opacity" from to dur>\n${buildAnimateMarkup({ attributeName: "opacity", from: 0.2, to: 1, dur: "2s" })}`;
}

export function mountSmilTransformDemo(canvas, toolbar, readout) {
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 200");
  canvas.append(svg);
  const g = document.createElementNS(svgNs(), "g");
  g.setAttribute("transform", "translate(320,100)");
  const rect = document.createElementNS(svgNs(), "rect");
  rect.setAttribute("x", "-40");
  rect.setAttribute("y", "-30");
  rect.setAttribute("width", "80");
  rect.setAttribute("height", "60");
  rect.setAttribute("fill", "#f59e0b");
  rect.innerHTML = buildAnimateTransformMarkup({ type: "rotate", from: 0, to: 360, dur: "4s" });
  g.append(rect);
  svg.append(g);
  readout.textContent = buildAnimateTransformMarkup({ type: "rotate", from: 0, to: 360, dur: "4s" });
}

export function mountSmilMotionDemo(canvas, toolbar, readout) {
  const pathD = "M 60 150 C 160 20, 480 280, 580 80";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 200");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("id", "motion-path");
  path.setAttribute("d", pathD);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#94a3b8");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-dasharray", "6 4");
  const dot = document.createElementNS(svgNs(), "circle");
  dot.setAttribute("r", "10");
  dot.setAttribute("fill", "#2563eb");
  dot.innerHTML = buildAnimateMotionMarkup({ pathId: "motion-path", dur: "5s", rotate: "auto" });
  svg.append(path, dot);
  readout.textContent = `${buildAnimateMotionMarkup({ pathId: "motion-path", dur: "5s", rotate: "auto" })}\n\narc length sampling: [017][018] · css-matrix 050`;
}

export function mountDashDrawDemo(canvas, toolbar, readout) {
  const pathD = "M 80 120 C 200 20, 440 220, 560 80";
  const segments = parsePathD(pathD);
  const len = Math.round(pathLength(segments, { stepsPerCurve: 24 }));
  const kit = strokeDashDrawKeyframes(len, { duration: "3s" });
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 200");
  canvas.append(svg);
  const style = document.createElementNS(svgNs(), "style");
  style.textContent = kit.keyframes;
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("d", pathD);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#2563eb");
  path.setAttribute("stroke-width", "4");
  path.setAttribute("pathLength", String(kit.pathLength));
  path.setAttribute("stroke-dasharray", String(kit.pathLength));
  path.setAttribute("style", kit.style);
  svg.append(style, path);
  readout.textContent = `pathLength=${len}\n${kit.keyframes}\n${kit.style}`;
}

export function mountCssMotionDemo(canvas, toolbar, readout) {
  const pathD = "M 40 100 Q 200 20 360 100 T 600 100";
  const css = buildOffsetPathMotionCss(pathD, {
    distance: "0%",
    keyframes: "move-path",
    duration: "4s"
  });
  const box = el("div", "");
  box.style.width = "100%";
  box.style.height = "200px";
  box.style.position = "relative";
  box.style.background = "#f8fafc";
  const dot = el("div", "");
  dot.textContent = "●";
  dot.style.position = "absolute";
  dot.style.offsetPath = css.offsetPath;
  dot.style.offsetDistance = css.distance;
  dot.style.offsetRotate = css.offsetRotate;
  dot.style.animation = css.animation;
  dot.style.fontSize = "28px";
  dot.style.color = "#2563eb";
  const style = document.createElement("style");
  style.textContent = `@keyframes move-path { to { offset-distance: 100%; } }`;
  box.append(dot);
  canvas.append(style, box);
  readout.textContent = `CSS offset-path (Chrome/Safari/Firefox modern)\noffset-path: ${css.offsetPath}\nanimation: ${css.animation}`;
}

export function mountPathMorphDemo(canvas, toolbar, readout) {
  const tSlider = range("morph t", 0, 100, 50);
  toolbar.append(tSlider.wrapper);
  const dFrom = "M 120 40 L 520 40 L 520 160 L 120 160 Z";
  const dTo = "M 200 20 L 440 20 L 500 180 L 140 180 Z";
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 200");
  canvas.append(svg);
  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("fill", "rgba(37,99,235,0.2)");
  path.setAttribute("stroke", "#1d4ed8");
  path.setAttribute("stroke-width", "2");
  svg.append(path);

  function render() {
    const t = Number(tSlider.input.value) / 100;
    const result = morphPathDLinear(dFrom, dTo, t);
    path.setAttribute("d", result.d);
    readout.textContent = `morphPathDLinear t=${t.toFixed(2)} compatible=${result.compatible}\n같은 segment 수·타입만 morph (topology 동일)`;
  }
  tSlider.input.addEventListener("input", render);
  render();
}

export function mountJsMotionDemo(canvas, toolbar, readout) {
  const progress = range("progress %", 0, 100, 0);
  toolbar.append(progress.wrapper);
  const pathD = "M 60 150 C 160 30, 480 270, 580 70";
  const segments = parsePathD(pathD);
  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 200");
  canvas.append(svg);
  const curve = document.createElementNS(svgNs(), "path");
  curve.setAttribute("d", pathD);
  curve.setAttribute("fill", "none");
  curve.setAttribute("stroke", "#cbd5e1");
  curve.setAttribute("stroke-width", "2");
  const dot = document.createElementNS(svgNs(), "circle");
  dot.setAttribute("r", "10");
  dot.setAttribute("fill", "#2563eb");
  svg.append(curve, dot);

  function render() {
    const p = Number(progress.input.value) / 100;
    const sample = sampleMotionAlongPath(segments, p, { stepsPerCurve: 32 });
    dot.setAttribute("cx", String(sample.point.x));
    dot.setAttribute("cy", String(sample.point.y));
    readout.textContent = `sampleMotionAlongPath progress=${p.toFixed(2)}\nlength=${sample.totalLength.toFixed(1)} distance=${sample.distance.toFixed(1)}\ntangent=(${sample.tangent.x.toFixed(2)}, ${sample.tangent.y.toFixed(2)})`;
  }
  progress.input.addEventListener("input", render);
  render();
}

export const ANIMATION_DEMO_MOUNTERS = {
  "anim-smil-attribute": mountSmilAnimateDemo,
  "anim-smil-transform": mountSmilTransformDemo,
  "anim-smil-motion": mountSmilMotionDemo,
  "anim-dash-draw": mountDashDrawDemo,
  "anim-css-motion": mountCssMotionDemo,
  "anim-path-morph": mountPathMorphDemo,
  "anim-js-motion": mountJsMotionDemo
};
