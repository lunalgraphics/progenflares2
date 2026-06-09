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
  <label title="Opacity of the streak">Alpha: <Slider min={0} max={100} bind:value={settings.alpha} on:input={update} /></label>
  <label title="Rotation angle of the streak">Angle: <Slider min={0} max={360} bind:value={settings.angle} on:input={update} /></label>
  <label title="Color hue of the streak">Hue: <Slider min={0} max={360} bind:value={settings.hue} on:input={update} className="hueSlider" /></label>
  <label title="Color saturation intensity">Saturation: <Slider min={0} max={100} bind:value={settings.saturation} on:input={update} /></label>
  <label title="Vertical thickness of the streak">Thickness: <Slider min={0} max={200} bind:value={settings.thickness} on:input={update} /></label>
  <label title="Horizontal extent of the streak">Length: <Slider min={0} max={5000} bind:value={settings.width} on:input={update} /></label>
  <label title="Brightness threshold of the streak texture">Intensity: <Slider min={-30} max={50} bind:value={settings.intensity} on:input={update} /></label>
  <label title="Number of streak rays (star points)">Starring: <Slider min={1} max={8} bind:value={settings.count} on:input={update} /></label>
  <label title="Asymmetric offset between left and right halves">Shift: <Slider min={0} max={100} bind:value={settings.shift} on:input={update} /></label>
</Collapsible>
