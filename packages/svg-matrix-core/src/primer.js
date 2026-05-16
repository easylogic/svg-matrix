export const SVG_CAPABILITY_MAP = [
  { topic: "viewBox / user space", svg: "viewBox, preserveAspectRatio", repo: "svg-matrix", lesson: "001" },
  { topic: "transform stack", svg: "transform, matrix", repo: "svg-matrix", lesson: "002" },
  { topic: "path d grammar", svg: "path commands M/L/C/Q/A/Z", repo: "svg-matrix", lesson: "003–012" },
  { topic: "stroke geometry", svg: "stroke-* attributes", repo: "svg-matrix", lesson: "004–006" },
  { topic: "fill rules", svg: "fill-rule nonzero/evenodd", repo: "svg-matrix", lesson: "014–015, 025–030" },
  { topic: "gradients / patterns", svg: "linearGradient, radialGradient, pattern", repo: "svg-matrix", lesson: "019–020, 032–034" },
  { topic: "filters", svg: "filter, fe*", repo: "svg-matrix", lesson: "031, 035–039" },
  { topic: "markers", svg: "marker, marker-start/end", repo: "svg-matrix", lesson: "064" },
  { topic: "text on path", svg: "text, textPath", repo: "svg-matrix", lesson: "063" },
  { topic: "SVG animation", svg: "animate, animateMotion, dashoffset", repo: "svg-matrix", lesson: "088–094" },
  { topic: "CSS overlay", svg: "mask-image, clip-path", repo: "css-matrix", lesson: "—" },
  { topic: "GPU rasterization", svg: "— (flatten → mesh)", repo: "webgl-webgpu-matrix", lesson: "—" }
];

export const FIGMA_SVG_LAYERS = [
  {
    layer: "Geometry",
    figma: "vectorNetwork, boolean, corner radius",
    svg: "path d, fill-rule, compound paths",
    repo: "svg-matrix"
  },
  {
    layer: "Paint",
    figma: "fills[], strokes[], strokeAlign",
    svg: "fill, stroke, gradients, patterns",
    repo: "svg-matrix"
  },
  {
    layer: "Effects",
    figma: "effects[] (shadow, blur)",
    svg: "filter, feDropShadow, feGaussianBlur",
    repo: "svg-matrix"
  },
  {
    layer: "Compositing",
    figma: "blendMode, opacity",
    svg: "mix-blend-mode, opacity, isolation",
    repo: "svg-matrix"
  },
  {
    layer: "Layout",
    figma: "auto-layout, constraints",
    svg: "— (DOM/CSS)",
    repo: "css-matrix"
  }
];

export function explainCoordinateStack(pointer, viewport, viewBox) {
  const { x: px, y: py } = pointer;
  const scaleX = viewport.width / viewBox.width;
  const scaleY = viewport.height / viewBox.height;
  const uniform = Math.min(scaleX, scaleY);
  const userX = viewBox.x + (px / viewport.width) * viewBox.width;
  const userY = viewBox.y + (py / viewport.height) * viewBox.height;
  return {
    pointer: { x: px, y: py },
    viewport,
    viewBox,
    userSpace: { x: userX, y: userY },
    scale: uniform,
    note: "pointer → viewport (px) → user space (viewBox units) → local path space (after transform)"
  };
}

export function pathPaintModel() {
  return {
    fill: "closed region inside path (winding / evenodd)",
    stroke: "centerline + half stroke-width each side",
    paintOrder: "fill, stroke, markers (default)",
    figmaStrokeAlign: "INSIDE/CENTER/OUTSIDE needs extra paths or clip in SVG"
  };
}
