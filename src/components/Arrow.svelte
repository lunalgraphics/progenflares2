<!--
  Simple CSS arrow/chevron component.
  Rotates based on the `direction` prop (degrees).
-->
<script>
  /** @type {number} Arrow direction in degrees (0 = down) */
  export let direction = 0;
  /** @type {number} Arrow size in pixels */
  export let size = 12;
  /** @type {string} Arrow border color */
  export let color = "#000000";
  /** @type {number} Border thickness in pixels */
  export let thickness = 2;
  /** @type {string} Additional inline styles */
  export let style = "";
  /** @type {number} Rotation animation duration in ms */
  export let rotationDuration = 400;
</script>

<div
  style="
    display: inline-block;
    width: {size}px;
    height: {size}px;
    border-bottom: {thickness}px solid {color};
    border-right: {thickness}px solid {color};
    transform: rotate({-45 - direction}deg);
    transition: transform {rotationDuration}ms;
    position: relative;
    z-index: -1;
    {style}
  "
/>
