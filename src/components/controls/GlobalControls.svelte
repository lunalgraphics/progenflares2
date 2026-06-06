<!-- Control panel section for global positioning and scale settings -->
<script>
  import { createEventDispatcher } from "svelte";
  import Collapsible from "../Collapsible.svelte";
  import Slider from "../Slider.svelte";

  const dispatch = createEventDispatcher();

  /** @type {Object} Positioning settings (bound from parent) */
  export let positioning;
  /** @type {Object} Dimensions settings for max slider values */
  export let dimensions;
  /** @type {number} Current size multiplier value */
  export let sizeMultiplier;

  /** Notify parent of general re-render */
  function update() {
    dispatch("change");
  }

  /** Notify parent that scale multiplier should be applied */
  function applyScale() {
    dispatch("applyScale");
  }
</script>

<Collapsible title="Global" collapsed={false}>
  Light X: <Slider min={0} max={dimensions.width} bind:value={positioning.x} on:input={update} /> <br />
  Light Y: <Slider min={0} max={dimensions.height} bind:value={positioning.y} on:input={update} /> <br />
  Focus X: <Slider min={0} max={dimensions.width} bind:value={positioning.pivotX} on:input={update} /> <br />
  Focus Y: <Slider min={0} max={dimensions.height} bind:value={positioning.pivotY} on:input={update} /> <br />
  Scale Multiplier: <Slider min={0.01} max={2} step={0.01} bind:value={sizeMultiplier} on:input={update} on:change={applyScale} /> <br />
</Collapsible>
