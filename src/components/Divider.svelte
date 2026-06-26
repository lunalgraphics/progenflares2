<!--
  Draggable divider component for resizable panel layouts.
  Supports horizontal (left-right) and vertical (top-bottom) orientations.
-->
<script>
  /** @type {"horizontal" | "vertical"} Layout orientation */
  export let layout = "horizontal";
  /** @type {number} Divider X position (controls panel width from right) */
  export let dividerX = 360;
  /** @type {number} Divider Y position (controls panel height from bottom) */
  export let dividerY = 360;
  /** @type {number} Minimum X value (minimum panel width) */
  export let minX = 270;
  /** @type {number} Minimum Y value */
  export let minY = 50;

  let dragging = false;

  function handlePointerDown() {
    dragging = true;
  }

  function handlePointerMove(e) {
    if (!dragging) return;

    if (layout === "horizontal") {
      dividerX = window.innerWidth - e.pageX;
      dividerX = Math.max(minX, Math.min(window.innerWidth, dividerX));
    } else {
      dividerY = window.innerHeight - e.pageY;
      dividerY = Math.max(minY, Math.min(window.innerHeight, dividerY));
    }
  }

  function handlePointerUp() {
    dragging = false;
  }
</script>

<svelte:window on:pointermove={handlePointerMove} on:pointerup={handlePointerUp} />

<div
  class="divider"
  data-layout={layout}
  style:--divider-x="{dividerX}px"
  style:--divider-y="{dividerY}px"
  on:pointerdown={handlePointerDown}
/>

<style>
  .divider {
    position: fixed;
    background-color: #353535;
    pointer-events: all;
    z-index: 2;
    --divider-size: 4px;
  }

  .divider:hover {
    background-color: var(--color-scheme-3);
  }

  .divider[data-layout="horizontal"] {
    height: 100vh;
    width: var(--divider-size);
    cursor: col-resize;
    bottom: 0;
    right: var(--divider-x);
    transform: translateX(50%);
  }

  .divider[data-layout="vertical"] {
    height: var(--divider-size);
    width: 100vw;
    cursor: row-resize;
    bottom: var(--divider-y);
    right: 0;
    transform: translateY(50%);
  }
</style>
