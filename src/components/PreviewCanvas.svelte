<!--
  PreviewCanvas.svelte — Zoomable/pannable container for the flare preview canvases.

  Zoom: scroll wheel up/down or trackpad pinch
  Pan:  right-click drag, middle-click drag, or two-finger trackpad scroll
  Left-click is reserved for positioning the flare light source.

  At zoom=1, the content is scaled to fit within the container with padding.
  Includes a small toolbar at the bottom for zoom in/out and reset.
-->
<script>
  import { onMount } from "svelte";

  // ─── Props ─────────────────────────────────────────────────────────
  /** @type {string} CSS class to pass through */
  export let className = "";
  /** @type {number} Native width of the canvas content (pixels) */
  export let contentWidth = 1920;
  /** @type {number} Native height of the canvas content (pixels) */
  export let contentHeight = 1080;

  // ─── Zoom/Pan State ────────────────────────────────────────────────
  let zoom = 1;
  let panX = 0;
  let panY = 0;

  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 10;
  const ZOOM_STEP = 0.1;
  const ZOOM_WHEEL_FACTOR = 0.001;
  const PADDING = 40; // px padding on each side when fitting

  /** @type {HTMLDivElement} The outer viewport container */
  let viewport;

  // ─── Base Scale (fit content in viewport) ──────────────────────────

  let viewportWidth = 800;
  let viewportHeight = 600;

  /**
   * Computes the scale factor needed to fit the content within the
   * viewport at zoom=1, respecting padding on all sides.
   */
  $: baseScale = Math.min(
    (viewportWidth - PADDING * 2) / contentWidth,
    (viewportHeight - PADDING * 2) / contentHeight,
    1 // never upscale beyond native resolution
  );

  /** The actual CSS scale applied to the canvas container */
  $: effectiveScale = baseScale * zoom;

  /** Update viewport dimensions on mount and resize */
  function measureViewport() {
    if (viewport) {
      viewportWidth = viewport.clientWidth;
      viewportHeight = viewport.clientHeight;
    }
  }

  onMount(() => {
    measureViewport();
  });

  // ─── Pan via Right-Click / Middle-Click Drag ───────────────────────
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panOriginX = 0;
  let panOriginY = 0;

  function handlePointerDown(e) {
    // Right-click (2) or middle-click (1) starts panning
    if (e.button === 2 || e.button === 1) {
      e.preventDefault();
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panOriginX = panX;
      panOriginY = panY;
      viewport.setPointerCapture(e.pointerId);
    }
  }

  function handlePointerMove(e) {
    if (!isPanning) return;
    const dx = e.clientX - panStartX;
    const dy = e.clientY - panStartY;
    panX = panOriginX + dx;
    panY = panOriginY + dy;
  }

  function handlePointerUp(e) {
    if (e.button === 2 || e.button === 1) {
      isPanning = false;
      viewport.releasePointerCapture(e.pointerId);
    }
  }

  // ─── Zoom via Scroll Wheel / Trackpad Pinch ────────────────────────

  function handleWheel(e) {
    e.preventDefault();

    if (e.ctrlKey) {
      // Pinch zoom (trackpad) or Ctrl+scroll → zoom
      const delta = -e.deltaY * ZOOM_WHEEL_FACTOR * 3;
      applyZoomAtPoint(delta, e.clientX, e.clientY);
    } else if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
      if (e.deltaMode === 0 && (Math.abs(e.deltaX) > 1 || Math.abs(e.deltaY) < 50)) {
        // Trackpad two-finger drag → pan
        panX -= e.deltaX;
        panY -= e.deltaY;
      } else {
        // Mouse scroll wheel → zoom
        const delta = -e.deltaY * ZOOM_WHEEL_FACTOR;
        applyZoomAtPoint(delta, e.clientX, e.clientY);
      }
    }
  }

  /**
   * Apply zoom centered around a screen point (mouse position).
   * Adjusts pan so the point under the cursor stays in place.
   */
  function applyZoomAtPoint(delta, clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    // Position of cursor relative to the viewport center
    const cx = clientX - rect.left - rect.width / 2;
    const cy = clientY - rect.top - rect.height / 2;

    const oldZoom = zoom;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta * zoom));
    const zoomRatio = zoom / oldZoom;

    // Adjust pan to keep the point under cursor stationary
    panX = cx - (cx - panX) * zoomRatio;
    panY = cy - (cy - panY) * zoomRatio;
  }

  // ─── Toolbar Actions ───────────────────────────────────────────────

  function zoomIn() {
    const rect = viewport.getBoundingClientRect();
    applyZoomAtPoint(ZOOM_STEP, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function zoomOut() {
    const rect = viewport.getBoundingClientRect();
    applyZoomAtPoint(-ZOOM_STEP, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function resetView() {
    zoom = 1;
    panX = 0;
    panY = 0;
  }

  // ─── Prevent Context Menu on Right-Click ───────────────────────────

  function handleContextMenu(e) {
    e.preventDefault();
  }

  /** Formatted zoom percentage for display */
  $: zoomPercent = Math.round(zoom * 100);
</script>

<svelte:window on:resize={measureViewport} />

<div
  class="preview-viewport {className}"
  class:panning={isPanning}
  bind:this={viewport}
  on:pointerdown={handlePointerDown}
  on:pointermove={handlePointerMove}
  on:pointerup={handlePointerUp}
  on:wheel|preventDefault={handleWheel}
  on:contextmenu={handleContextMenu}
>
  <!-- Transformed canvas wrapper — base scale fits to viewport, zoom/pan on top -->
  <div
    class="canvas-container"
    style="transform: translate(calc(-50% + {panX}px), calc(-50% + {panY}px)) scale({effectiveScale});"
  >
    <slot />
  </div>

  <!-- Zoom toolbar -->
  <div class="zoom-toolbar">
    <button class="zoom-btn" on:click={zoomOut} title="Zoom Out">−</button>
    <span class="zoom-label">{zoomPercent}%</span>
    <button class="zoom-btn" on:click={zoomIn} title="Zoom In">+</button>
    <button class="zoom-btn reset-btn" on:click={resetView} title="Reset View">⟲</button>
  </div>
</div>

<style>
  .preview-viewport {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    cursor: default;
  }

  .preview-viewport.panning {
    cursor: grabbing;
  }

  .canvas-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: center center;
  }

  .zoom-toolbar {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: rgba(30, 30, 30, 0.85);
    border: 1px solid #444;
    border-radius: 6px;
    padding: 3px 8px;
    z-index: 5;
    user-select: none;
  }

  .zoom-label {
    font-size: 11px;
    color: #ccc;
    min-width: 40px;
    text-align: center;
  }

  .zoom-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
  }

  .reset-btn {
    font-size: 16px;
    margin-left: 4px;
  }
</style>
