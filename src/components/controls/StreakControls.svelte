<!-- Control panel section for streak artifact settings -->
<script>
  import { createEventDispatcher } from "svelte";
  import Collapsible from "../Collapsible.svelte";
  import Slider from "../Slider.svelte";

  const dispatch = createEventDispatcher();

  /** @type {Object} Streak settings object (bound from parent) */
  export let settings;

  /** Notify parent that settings changed and streak needs re-render */
  function update() {
    dispatch("change");
  }
</script>

<Collapsible title="Streak">
  <label style="text-align: center;">
    <input type="checkbox" bind:checked={settings.visible} on:change={update} />
    Visible
  </label>
  Alpha: <Slider min={0} max={100} bind:value={settings.alpha} on:input={update} /> <br />
  Angle: <Slider min={0} max={360} bind:value={settings.angle} on:input={update} /> <br />
  Hue: <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /> <br />
  Saturation: <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /> <br />
  Thickness: <Slider min={0} max={200} bind:value={settings.thickness} on:input={update} /> <br />
  Length: <Slider min={0} max={5000} bind:value={settings.width} on:input={update} /> <br />
  Intensity: <Slider min={-30} max={50} bind:value={settings.intensity} on:input={update} /> <br />
  Starring: <Slider min={1} max={8} bind:value={settings.count} on:input={update} /> <br />
  Shift: <Slider min={0} max={100} bind:value={settings.shift} on:input={update} /> <br />
</Collapsible>
