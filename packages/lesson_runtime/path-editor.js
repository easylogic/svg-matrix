import {
  hitTestPathHandles,
  hitTestSubpathHandles,
  listPathHandles,
  listSubpathHandles,
  pathDFromSegments,
  pathFromD,
  updatePathHandle,
  updateSubpathHandle
} from "../svg-matrix-core/src/index.js";

function svgNs() {
  return "http://www.w3.org/2000/svg";
}

function clientToSvg(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  const width = viewBox.width || rect.width;
  const height = viewBox.height || rect.height;
  return {
    x: viewBox.x + ((clientX - rect.left) / rect.width) * width,
    y: viewBox.y + ((clientY - rect.top) / rect.height) * height
  };
}

function mountPathEditorCore(canvas, options, handleApi) {
  const {
    initialD = "M 80 280 C 120 80, 520 360, 560 120",
    showControls = true,
    allowDrag = true,
    onChange = () => {}
  } = options;

  const svg = document.createElementNS(svgNs(), "svg");
  svg.setAttribute("viewBox", "0 0 640 420");
  svg.style.touchAction = "none";
  canvas.append(svg);

  const grid = document.createElementNS(svgNs(), "rect");
  grid.setAttribute("width", "640");
  grid.setAttribute("height", "420");
  grid.setAttribute("fill", "#f8fafc");
  grid.setAttribute("pointer-events", "none");

  const path = document.createElementNS(svgNs(), "path");
  path.setAttribute("fill", "rgba(37, 99, 235, 0.12)");
  path.setAttribute("stroke", "#1d4ed8");
  path.setAttribute("stroke-width", "3");
  path.setAttribute("pointer-events", "none");

  const guides = document.createElementNS(svgNs(), "g");
  guides.setAttribute("pointer-events", "none");
  const handlesLayer = document.createElementNS(svgNs(), "g");
  svg.append(grid, path, guides, handlesLayer);

  let segments = pathFromD(initialD).segments;
  let activeHandle = null;

  function handleHue(handle) {
    if (handle.subpathIndex === 1) return "#7c3aed";
    if (handle.subpathIndex === 2) return "#059669";
    return "#2563eb";
  }

  function applyHandleStyle(circle, handle, highlightId) {
    const active = highlightId === handle.id;
    const hue = handleHue(handle);
    circle.setAttribute("cx", String(handle.point.x));
    circle.setAttribute("cy", String(handle.point.y));
    circle.setAttribute("r", handle.kind === "anchor" ? "7" : "5");
    circle.setAttribute("fill", active ? "#f59e0b" : handle.kind === "anchor" ? hue : "#ffffff");
    circle.setAttribute("stroke", active ? "#b45309" : hue);
    circle.setAttribute("stroke-width", "2");
    circle.dataset.handleId = handle.id;
    circle.style.pointerEvents = "all";
    if (allowDrag) circle.style.cursor = active ? "grabbing" : "grab";
  }

  function renderGuides() {
    guides.replaceChildren();
    if (!showControls) return;
    for (const segment of segments) {
      if (segment.type !== "C" && segment.type !== "Q") continue;
      const line = (from, to, dash) => {
        const guide = document.createElementNS(svgNs(), "line");
        guide.setAttribute("x1", String(from.x));
        guide.setAttribute("y1", String(from.y));
        guide.setAttribute("x2", String(to.x));
        guide.setAttribute("y2", String(to.y));
        guide.setAttribute("stroke", "#94a3b8");
        guide.setAttribute("stroke-width", "1");
        guide.setAttribute("stroke-dasharray", dash);
        guides.append(guide);
      };
      if (segment.type === "C") {
        line(segment.from, segment.cp1, "4 4");
        line(segment.to, segment.cp2, "4 4");
      }
      if (segment.type === "Q") line(segment.from, segment.cp, "4 4");
    }
  }

  function renderHandles(highlightId = null) {
    const handles = handleApi.list(segments);
    const existing = new Map(
      [...handlesLayer.querySelectorAll("circle[data-handle-id]")].map((node) => [
        node.dataset.handleId,
        node
      ])
    );

    for (const handle of handles) {
      let circle = existing.get(handle.id);
      if (!circle) {
        circle = document.createElementNS(svgNs(), "circle");
        handlesLayer.append(circle);
      }
      applyHandleStyle(circle, handle, highlightId);
      existing.delete(handle.id);
    }

    for (const orphan of existing.values()) orphan.remove();
    return handles;
  }

  function syncHandleGraphics(highlightId = null) {
    const handles = handleApi.list(segments);
    const circles = [...handlesLayer.querySelectorAll("circle[data-handle-id]")];
    if (circles.length !== handles.length) {
      renderHandles(highlightId);
      return handles;
    }
    const byId = new Map(handles.map((handle) => [handle.id, handle]));
    for (const circle of circles) {
      const handle = byId.get(circle.dataset.handleId);
      if (handle) applyHandleStyle(circle, handle, highlightId);
    }
    return handles;
  }

  function commit(nextSegments) {
    segments = nextSegments;
    path.setAttribute("d", pathDFromSegments(segments));
    renderGuides();
    if (activeHandle) {
      syncHandleGraphics(activeHandle.id);
    } else {
      renderHandles();
    }
    onChange({ segments, d: pathDFromSegments(segments), handles: handleApi.list(segments) });
  }

  function render() {
    path.setAttribute("d", pathDFromSegments(segments));
    renderGuides();
    renderHandles(activeHandle?.id ?? null);
    onChange({ segments, d: pathDFromSegments(segments), handles: handleApi.list(segments) });
  }

  function beginDrag(handle, event) {
    activeHandle = handle;
    svg.setPointerCapture(event.pointerId);
    syncHandleGraphics(handle.id);
    event.preventDefault();
  }

  function onPointerDown(event) {
    if (!allowDrag) return;
    const point = clientToSvg(svg, event.clientX, event.clientY);
    const hit =
      event.target?.dataset?.handleId != null
        ? handleApi.list(segments).find((handle) => handle.id === event.target.dataset.handleId)
        : handleApi.hit(point, segments, 12);
    if (!hit) return;
    beginDrag(hit, event);
  }

  function onPointerMove(event) {
    const point = clientToSvg(svg, event.clientX, event.clientY);
    if (activeHandle && allowDrag) {
      commit(handleApi.update(segments, activeHandle.id, point));
      activeHandle =
        handleApi.list(segments).find((handle) => handle.id === activeHandle.id) ?? null;
      return point;
    }
    const hit = handleApi.hit(point, segments, 12);
    renderHandles(hit?.id ?? null);
    return { point, hit };
  }

  function onPointerUp(event) {
    if (!activeHandle) return;
    activeHandle = null;
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    renderHandles();
  }

  svg.addEventListener("pointerdown", onPointerDown);
  svg.addEventListener("pointermove", onPointerMove);
  svg.addEventListener("pointerup", onPointerUp);
  svg.addEventListener("pointercancel", onPointerUp);

  render();

  return {
    svg,
    getState() {
      return { segments, d: pathDFromSegments(segments), handles: handleApi.list(segments) };
    },
    setPathD(d) {
      segments = pathFromD(d).segments;
      render();
    },
    destroy() {
      svg.remove();
    }
  };
}

export function createPathEditor(canvas, options = {}) {
  return mountPathEditorCore(canvas, options, {
    list: listPathHandles,
    hit: (point, segments, radius) => hitTestPathHandles(point, listPathHandles(segments), radius),
    update: updatePathHandle
  });
}

export function createCompoundPathEditor(canvas, options = {}) {
  return mountPathEditorCore(canvas, options, {
    list: listSubpathHandles,
    hit: (point, segments, radius) => hitTestSubpathHandles(point, segments, radius),
    update: updateSubpathHandle
  });
}
