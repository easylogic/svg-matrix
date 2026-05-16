const TAU = Math.PI * 2;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function scale(v, factor) {
  return { x: v.x * factor, y: v.y * factor };
}

export function svgArcCenterParameters(segment) {
  const { from, to, rx: rawRx, ry: rawRy, rotation, largeArc, sweep } = segment;
  let rx = Math.abs(rawRx);
  let ry = Math.abs(rawRy);
  if (rx < 1e-10 || ry < 1e-10) {
    return { cx: from.x, cy: from.y, rx: 0, ry: 0, startAngle: 0, deltaAngle: 0, degenerate: true };
  }

  const phi = (rotation * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dx = (from.x - to.x) / 2;
  const dy = (from.y - to.y) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  let rxSq = rx * rx;
  let rySq = ry * ry;
  const lambda = (x1p * x1p) / rxSq + (y1p * y1p) / rySq;
  if (lambda > 1) {
    const scaleFactor = Math.sqrt(lambda);
    rx *= scaleFactor;
    ry *= scaleFactor;
    rxSq = rx * rx;
    rySq = ry * ry;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const numerator = rxSq * rySq - rxSq * y1p * y1p - rySq * x1p * x1p;
  const denom = rxSq * y1p * y1p + rySq * x1p * x1p;
  const coef = denom === 0 ? 0 : sign * Math.sqrt(Math.max(0, numerator / denom));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (coef * -ry * x1p) / rx;

  const cx = cosPhi * cxp - sinPhi * cyp + (from.x + to.x) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (from.y + to.y) / 2;

  const angleBetween = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);

  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;
  let startAngle = angleBetween(1, 0, ux, uy);
  let deltaAngle = angleBetween(ux, uy, vx, vy);
  if (!sweep && deltaAngle > 0) deltaAngle -= TAU;
  if (sweep && deltaAngle < 0) deltaAngle += TAU;

  return { cx, cy, rx, ry, phi, startAngle, deltaAngle, degenerate: false };
}

function cubicFromArcSlice(cx, cy, rx, ry, phi, startAngle, deltaAngle) {
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const transform = (angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = rx * cos;
    const y = ry * sin;
    return { x: cosPhi * x - sinPhi * y + cx, y: sinPhi * x + cosPhi * y + cy };
  };
  const derivative = (angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = -rx * sin;
    const y = ry * cos;
    return { x: cosPhi * x - sinPhi * y, y: sinPhi * x + cosPhi * y };
  };
  const k = (4 / 3) * Math.tan(deltaAngle / 4);
  const p0 = transform(startAngle);
  const p3 = transform(startAngle + deltaAngle);
  return {
    type: "C",
    from: p0,
    cp1: add(p0, scale(derivative(startAngle), k)),
    cp2: subtract(p3, scale(derivative(startAngle + deltaAngle), k)),
    to: p3
  };
}

export function arcSegmentToCubics(segment) {
  const params = svgArcCenterParameters(segment);
  if (params.degenerate || Math.abs(params.deltaAngle) < 1e-10) {
    return [
      {
        type: "C",
        from: { ...segment.from },
        cp1: { ...segment.from },
        cp2: { ...segment.to },
        to: { ...segment.to }
      }
    ];
  }
  const sliceCount = Math.max(1, Math.ceil(Math.abs(params.deltaAngle) / (Math.PI / 2)));
  const slice = params.deltaAngle / sliceCount;
  const cubics = [];
  for (let i = 0; i < sliceCount; i += 1) {
    const start = params.startAngle + slice * i;
    cubics.push(cubicFromArcSlice(params.cx, params.cy, params.rx, params.ry, params.phi, start, slice));
  }
  if (cubics.length) cubics[0].from = { ...segment.from };
  cubics[cubics.length - 1].to = { ...segment.to };
  return cubics;
}
