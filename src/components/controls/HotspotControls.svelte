<!-- Control panel section for hotspot artifact settings -->
<script>
  import { createEventDispatcher } from "svelte";
  import Collapsible from "../Collapsible.svelte";
  import Slider from "../Slider.svelte";

  const dispatch = createEventDispatcher();

  /** @type {Object} Hotspot settings object (bound from parent) */
  export let settings;

  /** Notify parent that settings changed and hotspot needs re-render */
  function update() {
    dispatch("change");
  }
</script>

<Collapsible title="Hotspot">
  <label style="text-align: center;">
    <input type="checkbox" bind:checked={settings.visible} on:change={update} />
    Visible
  </label>
  Alpha: <Slider min={0} max={100} bind:value={settings.alpha} on:input={update} /> <br />
  Angle: <Slider min={0} max={360} bind:value={settings.angle} on:input={update} /> <br />
  Hue: <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /> <br />
  Saturation: <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /> <br />
  Size: <Slider min={0} max={1000} bind:value={settings.radius} on:input={update} /> <br />
  Intensity: <Slider min={0} max={50} bind:value={settings.intensity} on:input={update} /> <br />
  Rays Frequency: <Slider min={0} max={0.05} step={0.001} bind:value={settings.deformationFrequency} on:input={update} /> <br />
  Rays Definition: <Slider min={0} max={2.1} step={0.01} bind:value={settings.deformationAmount} on:input={update} /> <br />
  Rays Detail: <Slider min={1} max={5} step={1} bind:value={settings.deformationOctaves} on:input={update} /> <br />
  Random Seed: <Slider min={1} max={999} bind:value={settings.deformationSeed} on:input={update} /> <br />
  Anamorph: <Slider min={0} max={100} bind:value={settings.anamorph} on:input={update} /> <br />
</Collapsible>
