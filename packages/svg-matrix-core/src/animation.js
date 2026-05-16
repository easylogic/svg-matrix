function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** SMIL `<animate attributeName="…" from to dur>` */
export function buildAnimateMarkup(options) {
  const {
    attributeName,
    from,
    to,
    dur = "2s",
    begin = "0s",
    repeatCount = "indefinite",
    fill = "freeze",
    calcMode = "linear"
  } = options;
  const attrs = [
    `attributeName="${attributeName}"`,
    from != null ? `from="${from}"` : null,
    to != null ? `to="${to}"` : null,
    `dur="${dur}"`,
    `begin="${begin}"`,
    `repeatCount="${repeatCount}"`,
    `fill="${fill}"`,
    `calcMode="${calcMode}"`
  ]
    .filter(Boolean)
    .join(" ");
  return `<animate ${attrs}/>`;
}

/** SMIL `<animateTransform type="…" …>` */
export function buildAnimateTransformMarkup(options) {
  const {
    type = "rotate",
    from,
    to,
    dur = "2s",
    begin = "0s",
    repeatCount = "indefinite",
    additive = "sum",
    fill = "freeze"
  } = options;
  const attrs = [
    `attributeName="transform"`,
    `type="${type}"`,
    from != null ? `from="${from}"` : null,
    to != null ? `to="${to}"` : null,
    `dur="${dur}"`,
    `begin="${begin}"`,
    `repeatCount="${repeatCount}"`,
    `additive="${additive}"`,
    `fill="${fill}"`
  ]
    .filter(Boolean)
    .join(" ");
  return `<animateTransform ${attrs}/>`;
}

/** SMIL `<animateMotion>` with optional `<mpath>` */
export function buildAnimateMotionMarkup(options) {
  const {
    pathD,
    pathId,
    dur = "4s",
    begin = "0s",
    repeatCount = "indefinite",
    rotate = "auto",
    fill = "freeze",
    keyPoints,
    keyTimes
  } = options;
  const motionAttrs = [
    pathD && !pathId ? `path="${pathD}"` : null,
    `dur="${dur}"`,
    `begin="${begin}"`,
    `repeatCount="${repeatCount}"`,
    rotate != null ? `rotate="${rotate}"` : null,
    `fill="${fill}"`,
    keyPoints != null ? `keyPoints="${keyPoints}"` : null,
    keyTimes != null ? `keyTimes="${keyTimes}"` : null
  ]
    .filter(Boolean)
    .join(" ");
  const mpath = pathId ? `\n  <mpath href="#${pathId}"/>` : "";
  return `<animateMotion ${motionAttrs}>${mpath}\n</animateMotion>`;
}

/** Wrap element + SMIL children */
export function buildAnimatedElementMarkup(options) {
  const { tag, attributes = {}, children = [], animations = [] } = options;
  const attrStr = Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeXml(value)}"`)
    .join(" ");
  const anim = animations.join("\n  ");
  return [`<${tag} ${attrStr}>`, anim ? `  ${anim}` : null, ...children.map((c) => `  ${c}`), `</${tag}>`]
    .filter(Boolean)
    .join("\n");
}

/** CSS draw-on: pathLength + dasharray + animate dashoffset */
export function strokeDashDrawKeyframes(pathLengthValue, options = {}) {
  const id = options.name ?? "draw-on";
  const duration = options.duration ?? "2s";
  const easing = options.easing ?? "ease-in-out";
  return {
    pathLength: pathLengthValue,
    pathAttrs: { "pathLength": String(pathLengthValue), "stroke-dasharray": String(pathLengthValue) },
    keyframes: `@keyframes ${id} {\n  to { stroke-dashoffset: 0; }\n}`,
    style: `stroke-dashoffset: ${pathLengthValue}; animation: ${id} ${duration} ${easing} forwards;`,
    animationName: id
  };
}

/** CSS motion along path */
export function buildOffsetPathMotionCss(pathD, options = {}) {
  const escaped = pathD.replace(/"/g, '\\"');
  return {
    offsetPath: `path("${escaped}")`,
    offsetDistance: options.distance ?? "0%",
    offsetRotate: options.rotate ?? "auto",
    transition: options.transition ?? null,
    animation: options.keyframes
      ? `${options.keyframes} ${options.duration ?? "4s"} ${options.easing ?? "linear"} infinite`
      : null
  };
}

export const SVG_ANIMATION_TOPIC_MAP = [
  { topic: "SMIL animate attribute", lesson: "088" },
  { topic: "animateTransform", lesson: "089" },
  { topic: "animateMotion / mpath", lesson: "090" },
  { topic: "stroke dash draw-on", lesson: "091" },
  { topic: "CSS offset-path motion", lesson: "092" },
  { topic: "path morph (compatible d)", lesson: "093" },
  { topic: "JS motion along path", lesson: "094" }
];
