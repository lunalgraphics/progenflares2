<!-- Control panel section for glow artifact settings -->
<script>
  import { createEventDispatcher } from "svelte";
  import Collapsible from "../Collapsible.svelte";
  import Slider from "../Slider.svelte";

  const dispatch = createEventDispatcher();

  /** @type {Object} Glow settings object (bound from parent) */
  export let settings;

  /** Notify parent that settings changed and glow needs re-render */
  function update() {
    dispatch("change");
  }
</script>

<Collapsible title="Glow">
  <label style="text-align: center;">
    <input type="checkbox" bind:checked={settings.visible} on:change={update} />
    Visible
  </label>
  <label title="Opacity of the background glow">Alpha <Slider min={0} max={100} bind:value={settings.alpha} on:input={update} /></label>
  <label title="Color hue of the glow">Hue <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /></label>
  <label title="Color saturation intensity">Saturation <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /></label>
  <label title="Radius of the glow area">Size <Slider min={0} max={1500} bind:value={settings.radius} on:input={update} /></label>
  <label title="How gradually the glow fades out">Softness <Slider min={0} max={200} bind:value={settings.softening} on:input={update} /></label>
  <label title="Vertical squash for anamorphic lens look">Anamorph <Slider min={0} max={100} bind:value={settings.anamorph} on:input={update} /></label>
</Collapsible>
