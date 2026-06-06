<!-- Control panel section for lens orbs artifact settings -->
<script>
  import { createEventDispatcher } from "svelte";
  import Collapsible from "../Collapsible.svelte";
  import Slider from "../Slider.svelte";

  const dispatch = createEventDispatcher();

  /** @type {Object} Lens orbs settings object (bound from parent) */
  export let settings;

  /** Notify parent that settings changed and lens orbs needs re-render */
  function update() {
    dispatch("change");
  }
</script>

<Collapsible title="Lens Orbs">
  <label style="text-align: center;">
    <input type="checkbox" bind:checked={settings.visible} on:change={update} />
    Visible
  </label>
  Count: <Slider min={0} max={200} bind:value={settings.count} on:input={update} /> <br />
  Threshold: <Slider min={0} max={1500} bind:value={settings.threshold} on:input={update} /> <br />
  Fill Alpha: <Slider min={0} max={100} bind:value={settings.fillAlpha} on:input={update} /> <br />
  Fringe Alpha: <Slider min={0} max={100} bind:value={settings.fringeAlpha} on:input={update} /> <br />
  Angle: <Slider min={0} max={360} bind:value={settings.angle} on:input={update} /> <br />
  Hue: <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /> <br />
  Saturation: <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /> <br />
  Size: <Slider min={0} max={810} bind:value={settings.radius} on:input={update} /> <br />
  Edges: <Slider min={3} max={12} bind:value={settings.sides} on:input={update} /> <br />
  Roundness: <Slider min={0} max={100} bind:value={settings.roundness} on:input={update} /> <br />
  Fringe Size: <Slider min={0} max={100} bind:value={settings.fringeSize} on:input={update} /> <br />
  Softness: <Slider min={0} max={30} bind:value={settings.blur} on:input={update} /> <br />
  Size Variance: <Slider min={0} max={100} bind:value={settings.sizeVariance} on:input={update} /> <br />
  Alpha Variance: <Slider min={0} max={100} bind:value={settings.alphaVariance} on:input={update} /> <br />
  Hue Variance: <Slider min={0} max={180} bind:value={settings.hueVariance} on:input={update} /> <br />
  Random Seed: <Slider min={0} max={999} bind:value={settings.seed} on:input={update} /> <br />
  Anamorph: <Slider min={0} max={100} bind:value={settings.anamorph} on:input={update} /> <br />
</Collapsible>
