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
  <label title="Total number of orbs scattered across the image">Count: <Slider min={0} max={200} bind:value={settings.count} on:input={update} /></label>
  <label title="Max distance from light source for orb visibility">Threshold: <Slider min={0} max={1500} bind:value={settings.threshold} on:input={update} /></label>
  <label title="Opacity of orb interior fill">Fill Alpha: <Slider min={0} max={100} bind:value={settings.fillAlpha} on:input={update} /></label>
  <label title="Brightness of orb edge fringe">Fringe Alpha: <Slider min={0} max={100} bind:value={settings.fringeAlpha} on:input={update} /></label>
  <label title="Rotation of the orb polygon shape">Angle: <Slider min={0} max={360} bind:value={settings.angle} on:input={update} /></label>
  <label title="Base color hue of the orbs">Hue: <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /></label>
  <label title="Color saturation intensity">Saturation: <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /></label>
  <label title="Radius of each orb">Size: <Slider min={0} max={810} bind:value={settings.radius} on:input={update} /></label>
  <label title="Number of polygon sides (3=triangle, 6=hexagon)">Edges: <Slider min={3} max={12} bind:value={settings.sides} on:input={update} /></label>
  <label title="How rounded the polygon edges are (100=circle)">Roundness: <Slider min={0} max={100} bind:value={settings.roundness} on:input={update} /></label>
  <label title="Width of the edge fringe glow">Fringe Size: <Slider min={0} max={100} bind:value={settings.fringeSize} on:input={update} /></label>
  <label title="Overall blur applied to each orb">Softness: <Slider min={0} max={30} bind:value={settings.blur} on:input={update} /></label>
  <label title="Random variation in orb sizes">Size Variance: <Slider min={0} max={100} bind:value={settings.sizeVariance} on:input={update} /></label>
  <label title="Random variation in orb opacity">Alpha Variance: <Slider min={0} max={100} bind:value={settings.alphaVariance} on:input={update} /></label>
  <label title="Random hue offset range per orb">Hue Variance: <Slider min={0} max={180} bind:value={settings.hueVariance} on:input={update} /></label>
  <label title="Seed for reproducible random placement">Random Seed: <Slider min={0} max={999} bind:value={settings.seed} on:input={update} /></label>
  <label title="Vertical squash for anamorphic lens look">Anamorph: <Slider min={0} max={100} bind:value={settings.anamorph} on:input={update} /></label>
</Collapsible>
