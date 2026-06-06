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
  Alpha: <Slider min={0} max={100} bind:value={settings.alpha} on:input={update} /> <br />
  Hue: <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /> <br />
  Saturation: <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /> <br />
  Size: <Slider min={0} max={810} bind:value={settings.radius} on:input={update} /> <br />
  Thickness: <Slider min={0} max={500} bind:value={settings.thickness} on:input={update} /> <br />
  Softness: <Slider min={0} max={50} bind:value={settings.blur} on:input={update} /> <br />
  Crop Size: <Slider min={0} max={810} bind:value={settings.cropSize} on:input={update} /> <br />
  Crop Hardness: <Slider min={0} max={100} bind:value={settings.cropHardness} on:input={update} /> <br />
  Anamorph: <Slider min={0} max={100} bind:value={settings.anamorph} on:input={update} /> <br />
</Collapsible>
