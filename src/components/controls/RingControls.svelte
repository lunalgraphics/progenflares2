<!-- Control panel section for ring artifact settings -->
<script>
  import { createEventDispatcher } from "svelte";
  import Collapsible from "../Collapsible.svelte";
  import Slider from "../Slider.svelte";

  const dispatch = createEventDispatcher();

  /** @type {Object} Ring settings object (bound from parent) */
  export let settings;

  /** Notify parent that settings changed and ring needs re-render */
  function update() {
    dispatch("change");
  }
</script>

<Collapsible title="Ring">
  <label style="text-align: center;">
    <input type="checkbox" bind:checked={settings.visible} on:change={update} />
    Visible
  </label>
  <label title="Opacity of the ring">Alpha <Slider min={0} max={100} bind:value={settings.alpha} on:input={update} /></label>
  <label title="Color hue of the ring">Hue <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /></label>
  <label title="Color saturation intensity">Saturation <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /></label>
  <label title="Radius of the ring">Size <Slider min={0} max={810} bind:value={settings.radius} on:input={update} /></label>
  <label title="Width of the ring band">Thickness <Slider min={0} max={500} bind:value={settings.thickness} on:input={update} /></label>
  <label title="Gaussian blur applied to the ring">Softness <Slider min={0} max={50} bind:value={settings.blur} on:input={update} /></label>
  <label title="Height of the vertical crop fade">Crop Size <Slider min={0} max={810} bind:value={settings.cropSize} on:input={update} /></label>
  <label title="Sharpness of the crop edge transition">Crop Hardness <Slider min={0} max={100} bind:value={settings.cropHardness} on:input={update} /></label>
  <label title="Vertical squash for anamorphic lens look">Anamorph <Slider min={0} max={100} bind:value={settings.anamorph} on:input={update} /></label>
</Collapsible>
