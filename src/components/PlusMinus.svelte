<!--
  Animated plus/minus icon component.
  Transitions between + and - states via CSS height/top animation.
-->
<script>
  /** @type {boolean} Whether to show the plus (vertical bar visible) */
  export let plus = true;
  /** @type {number} Icon size in pixels */
  export let size = 12;
  /** @type {string} Bar color */
  export let color = "#000000";
  /** @type {number} Bar thickness in pixels */
  export let thickness = 2;
  /** @type {string} Additional inline styles */
  export let style = "";
</script>

<div
  {style}
  style:display="inline-block"
  style:width="{size}px"
  style:height="{size}px"
  style:position="relative"
  style:z-index={-1}
>
  <!-- Horizontal bar (always visible) -->
  <div
    style:position="absolute"
    style:left="0"
    style:top="{size / 2 - thickness / 2}px"
    style:width="{size}px"
    style:height="{thickness}px"
    style:background-color={color}
  />
  <!-- Vertical bar (animated for plus/minus toggle) -->
  <div
    style:position="absolute"
    style:left="{size / 2 - thickness / 2}px"
    style:top="{plus ? 0 : size / 2}px"
    style:width="{thickness}px"
    style:height="{plus ? size : 0}px"
    style:background-color={color}
    style:transition="height 0.3s, top 0.3s"
  />
</div>
