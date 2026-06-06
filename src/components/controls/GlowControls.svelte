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
  Alpha: <Slider min={0} max={100} bind:value={settings.alpha} on:input={update} /> <br />
  Hue: <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /> <br />
  Saturation: <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /> <br />
  Size: <Slider min={0} max={1500} bind:value={settings.radius} on:input={update} /> <br />
  Softness: <Slider min={0} max={200} bind:value={settings.softening} on:input={update} /> <br />
  Anamorph: <Slider min={0} max={100} bind:value={settings.anamorph} on:input={update} /> <br />
</Collapsible>
