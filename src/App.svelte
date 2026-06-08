<!--
  App.svelte — Main application shell for Progen Flares 2.
  Manages the canvas preview, control panel layout, export functionality,
  and platform-specific integrations (Photoshop UXP, popup plugin).
-->
<script>
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";

  // Components
  import Divider from "./components/Divider.svelte";
  import PresetPicker from "./components/PresetPicker.svelte";
  import GlobalControls from "./components/controls/GlobalControls.svelte";
  import HotspotControls from "./components/controls/HotspotControls.svelte";
  import StreakControls from "./components/controls/StreakControls.svelte";
  import RingControls from "./components/controls/RingControls.svelte";
  import MultiIrisControls from "./components/controls/MultiIrisControls.svelte";
  import GlowControls from "./components/controls/GlowControls.svelte";
  import LensOrbsControls from "./components/controls/LensOrbsControls.svelte";

  // Flare engine
  import { Spot, Ring, Iris } from "./flareArtifacts";
  import { renderFlare } from "./state/renderEngine";
  import { DEFAULT_FLARE_SETTINGS } from "./state/defaultSettings";
  import canvasClickDrag from "./utils/canvasClickDrag";

  // Assets
  import textLogo from "./images/textLogo.png";
  import coverImage from "./images/coverImage.jpg";

  // ─── Flare Artifact Instances ────────────────────────────────────────
  let flareArtifacts = {
    hotspot: new Spot(256, { deformationFrequency: 0.006 }),
    streak: new Spot(256, { deformationAmount: 0, intensity: 0 }),
    ring: new Ring(256, { cropSize: 0 }),
    miIris: new Iris(256, { roundness: 20 }),
    glow: new Spot(256, { deformationAmount: 0, intensity: -50 }),
    lensOrbs: new Iris(256, {}),
  };

  // ─── Flare Settings State ───────────────────────────────────────────
  let flareSettings = JSON.parse(JSON.stringify(DEFAULT_FLARE_SETTINGS));

  // ─── Canvas References ──────────────────────────────────────────────
  let baseCanvas;
  let referenceImage;

  // ─── Render Helpers ─────────────────────────────────────────────────

  /** Trigger a re-render with specific artifact flags */
  function render(flags = {}) {
    renderFlare(baseCanvas, flareArtifacts, flareSettings, flags);
  }

  /** Re-render everything (all artifacts) */
  function renderAll() {
    render({ hotspot: true, streak: true, ring: true, miIris: true, glow: true, lensOrbs: true });
  }

  // ─── Canvas Interaction ─────────────────────────────────────────────

  /** Handle click-drag on the canvas to move the light position */
  function handleClickDrag(e) {
    flareSettings.positioning.x = e.detail.x;
    flareSettings.positioning.y = e.detail.y;
    render();
  }

  // ─── Export Functions ───────────────────────────────────────────────

  /** Create an anchor element with a full-quality export image */
  function createDownloadLink() {
    const initialDownscaling = flareSettings.downscaling;
    flareSettings.downscaling = 1;
    render({ hotspot: true, streak: true, ring: true, miIris: true, glow: true });

    const a = document.createElement("a");
    a.href = baseCanvas.toDataURL("image/" + flareSettings.exportType);
    a.download = "ProgenFlares2-flare." + flareSettings.exportType;

    // Restore preview quality
    flareSettings.downscaling = initialDownscaling;
    render({ hotspot: true, streak: true, ring: true, miIris: true, glow: true });
    return a;
  }

  /** Create an anchor element to download current settings as a .pgf2 preset */
  function createPresetSaveLink() {
    const fileContents = JSON.stringify({
      hotspot: flareSettings.hotspot,
      streak: flareSettings.streak,
      ring: flareSettings.ring,
      miIris: flareSettings.miIris,
      glow: flareSettings.glow,
      lensOrbs: flareSettings.lensOrbs,
    });
    const blob = new Blob([fileContents], { type: "application/pgf2" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ProgenFlares2-preset.pgf2";
    return a;
  }

  // ─── Preset Management ─────────────────────────────────────────────

  /** Apply a preset's settings onto the current flareSettings */
  function setPreset(presetData) {
    for (const key in presetData) {
      if (!flareSettings[key]) flareSettings[key] = {};
      for (const subKey in presetData[key]) {
        flareSettings[key][subKey] = presetData[key][subKey];
      }
    }
    // Handle backwards compatibility for older presets
    if (!presetData.lensOrbs) flareSettings.lensOrbs.visible = false;
    if (!presetData.hotspot.deformationOctaves) flareSettings.hotspot.deformationOctaves = 5;
    renderAll();
  }

  // ─── Start Screen ──────────────────────────────────────────────────

  let startScreenVisible = true;
  let myPresetPicker;
  let overrideSetPreset = false;

  /** Initialize the project and dismiss the start screen */
  function onStart() {
    if (!overrideSetPreset) {
      setPreset(myPresetPicker.defaultPreset);
      flareSettings.positioning.pivotX = flareSettings.dimensions.width / 2;
      flareSettings.positioning.pivotY = flareSettings.dimensions.height / 2;
      flareSettings.positioning.x = flareSettings.dimensions.width * 2 / 5;
      flareSettings.positioning.y = flareSettings.dimensions.height * 2 / 5;
    }
    renderAll();
    startScreenVisible = false;
  }

  // ─── Reference Image ───────────────────────────────────────────────

  let rIcheckbox;

  /** Open a file picker to import a reference image */
  function handleRIbutton() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png, image/jpeg";
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.addEventListener("loadend", (e) => {
        referenceImage.style.backgroundImage = `url("${e.target.result}")`;
        rIcheckbox.checked = true;
        handleRIcheckbox();
      });
      reader.readAsDataURL(file);
    });
    fileInput.click();
  }

  /** Toggle reference image visibility */
  function handleRIcheckbox() {
    if (rIcheckbox.checked) {
      referenceImage.style.backgroundSize = "100% 100%";
    } else {
      referenceImage.style.backgroundSize = "0 0";
    }
  }

  // ─── Scale Multiplier ──────────────────────────────────────────────

  /** Apply the scale multiplier to all size-related settings, then reset it to 1 */
  function handleScaleMultiplier() {
    const m = flareSettings.sizeMultiplier;
    flareSettings.hotspot.radius *= m;
    flareSettings.streak.thickness *= m;
    flareSettings.streak.width *= m;
    flareSettings.ring.radius *= m;
    flareSettings.ring.thickness *= m;
    flareSettings.ring.blur *= m;
    flareSettings.ring.cropSize *= m;
    flareSettings.miIris.radius *= m;
    flareSettings.miIris.fringeSize *= m;
    flareSettings.miIris.blur *= m;
    flareSettings.glow.radius *= m;
    flareSettings.lensOrbs.radius *= m;
    flareSettings.lensOrbs.fringeSize *= m;
    flareSettings.lensOrbs.blur *= m;
    flareSettings.sizeMultiplier = 1;
    renderAll();
  }

  // ─── Responsive Layout ─────────────────────────────────────────────

  /** @type {"horizontal" | "vertical"} */
  let layout = "horizontal";
  let dividerX = 360;
  let dividerY = 360;

  function updateLayout() {
    layout = window.innerWidth < 400 ? "vertical" : "horizontal";
  }

  // ─── Platform Integration ──────────────────────────────────────────

  // Injected at build time via rollup replace plugin.
  // Use `npm run build:photoshop` or `npm run build:photopea` to set this to true.
  let isPhotopeaPlugin = __IS_PHOTOPEA_PLUGIN__;
  let isPhotoshopPlugin = __IS_PHOTOSHOP_PLUGIN__;
  let editingLayerPhotoshop = "no";

  // ─── Preset Picker ───────────────────────────────────────────────────────
  let presetPickerOpen = false;

  onMount(() => {
    renderAll();

    if (isPhotoshopPlugin) {
      // Photoshop UXP plugin messaging
      window.addEventListener("message", (e) => {
        if (typeof e.data === "string") e.data = JSON.parse(e.data);

        if (e.data.type === "init") {
          flareSettings.dimensions.width = parseInt(e.data.docWidth);
          flareSettings.dimensions.height = parseInt(e.data.docHeight);
          editingLayerPhotoshop = e.data.editingLayer ?? "no";
          setTimeout(onStart, 1);
        } else if (e.data.type === "refImage") {
          referenceImage.style.backgroundImage = `url("${e.data.data}")`;
          rIcheckbox.checked = true;
          handleRIcheckbox();
        } else if (e.data.type === "flareSettings") {
          const incoming = typeof e.data.data === "string"
            ? JSON.parse(e.data.data)
            : e.data.data;
          incoming.downscaling = 5 / 2;
          if (startScreenVisible) overrideSetPreset = true;
          flareSettings = incoming;
          renderAll();
        }
      });
      window.uxpHost.postMessage({ type: "webViewLoaded", data: true });
    } else if (isPhotopeaPlugin) {
      // Photopea plugin mode
      const locSearch = new URLSearchParams(location.search);
      flareSettings.dimensions.width = parseInt(locSearch.get("docWidth"));
      flareSettings.dimensions.height = parseInt(locSearch.get("docHeight"));
      setTimeout(onStart, 1);
      window.addEventListener("message", (e) => {
        if (e.data[0] === "refImage") {
          referenceImage.style.backgroundImage = `url("${e.data[1]}")`;
          rIcheckbox.checked = true;
          handleRIcheckbox();
        }
      });
      window.opener.postMessage(["pluginStatus", "ready"]);
    }

    updateLayout();
  });
</script>

<svelte:window on:resize={updateLayout} />

<!-- ─── Export Bar ──────────────────────────────────────────────────── -->
<div id="exportPanel" data-layout={layout} style:--divider-x="{dividerX}px" style:--divider-y="{dividerY}px">
  <div class="centered">
    {#if !isPhotopeaPlugin && !isPhotoshopPlugin}
      <button on:click={() => createDownloadLink().click()}>Export</button>
      <span style="display: inline-block; margin-left: 5px; margin-right: 5px;">as</span>
      <select bind:value={flareSettings.exportType}>
        <option value="png">PNG</option>
        <option value="jpeg">JPG</option>
        <option value="webp">WebP</option>
      </select>
    {:else if isPhotopeaPlugin}
      <button on:click={() => window.opener.postMessage(["finalImage", createDownloadLink().href])}>
        Finish
      </button>
      <span style="white-space: pre;">{"  "}</span>
      <button on:click={() => window.close()}>Close</button>
    {:else if isPhotoshopPlugin}
      <button on:click={() => {
        flareSettings.downscaling = 1;
        render({ hotspot: true, streak: true, ring: true, miIris: true, glow: true });
        const imageData = baseCanvas.getContext("2d").getImageData(0, 0, baseCanvas.width, baseCanvas.height);
        window.uxpHost.postMessage({
          type: "exportLayer",
          data: Array.from(imageData.data),
          metadata: JSON.stringify(flareSettings),
          editingLayer: editingLayerPhotoshop,
        });
      }}>
        Finish
      </button>
    {/if}
  </div>
</div>

<!-- ─── Preview Section ─────────────────────────────────────────────── -->
<div id="previewSection" data-layout={layout} style:--divider-x="{dividerX}px" style:--divider-y="{dividerY}px">
  <canvas
    bind:this={referenceImage}
    id="referenceImage"
    width={flareSettings.dimensions.width}
    height={flareSettings.dimensions.height}
    class="centered"
  />
  <canvas
    bind:this={baseCanvas}
    id="baseCanvas"
    use:canvasClickDrag
    on:clickDrag={handleClickDrag}
    width={flareSettings.dimensions.width}
    height={flareSettings.dimensions.height}
    class="centered"
  />
</div>

<!-- ─── Preview Quality Bar ─────────────────────────────────────────── -->
<div id="sectionAbovePreview" data-layout={layout} style:--divider-x="{dividerX}px" style:--divider-y="{dividerY}px">
  <div class="centered" style:width="100%" style:text-align="center">
    Preview quality
    <select bind:value={flareSettings.downscaling} on:change={() => render({ hotspot: true, streak: true, ring: true, miIris: true, glow: true })}>
      <option value={1}>100%</option>
      <option value={5 / 4}>80%</option>
      <option value={5 / 3}>60%</option>
      <option value={5 / 2}>40%</option>
      <option value={5}>20%</option>
    </select>
    <span style="white-space: pre; color: grey;">{"    |    "}</span>
    <input type="checkbox" bind:this={rIcheckbox} on:change={handleRIcheckbox} checked style="margin-bottom: 0;" />
    Reference Image
    <button on:click={handleRIbutton}>Import</button>
  </div>
</div>

<!-- ─── Panel Divider ───────────────────────────────────────────────── -->
<Divider {layout} bind:dividerX bind:dividerY />

<!-- ─── Control Panel ───────────────────────────────────────────────── -->
<div id="controlPanel" data-layout={layout} style:--divider-x="{dividerX}px" style:--divider-y="{dividerY}px">
  <!-- Preset bar (sticky header) -->
  <div class="preset-bar">
    <button style="width: 49%;" on:click={() => (presetPickerOpen = true)}>
      Apply Preset
    </button>
    <button on:click={() => createPresetSaveLink().click()} style="float: right; width: 49%;">
      Create Preset
    </button>
  </div>

  <!-- Artifact control sections -->
  <GlobalControls
    bind:positioning={flareSettings.positioning}
    dimensions={flareSettings.dimensions}
    bind:sizeMultiplier={flareSettings.sizeMultiplier}
    on:change={() => render()}
    on:applyScale={handleScaleMultiplier}
  />
  <HotspotControls
    bind:settings={flareSettings.hotspot}
    on:change={() => render({ hotspot: true })}
  />
  <StreakControls
    bind:settings={flareSettings.streak}
    on:change={() => render({ streak: true })}
  />
  <RingControls
    bind:settings={flareSettings.ring}
    on:change={() => render({ ring: true })}
  />
  <MultiIrisControls
    bind:settings={flareSettings.miIris}
    on:change={() => render({ miIris: true })}
  />
  <GlowControls
    bind:settings={flareSettings.glow}
    on:change={() => render({ glow: true })}
  />
  <LensOrbsControls
    bind:settings={flareSettings.lensOrbs}
    on:change={() => render({ lensOrbs: true })}
  />
</div>

<!-- Preset Picker (Modal) -->
<PresetPicker
  on:choose={(e) => setPreset(e.detail)}
  bind:this={myPresetPicker}
  {isPhotoshopPlugin}
  bind:pickerOpen={presetPickerOpen}
/>

<!-- ─── Start Screen ────────────────────────────────────────────────── -->
{#if startScreenVisible}
  <div id="startScreen" style="background-image: url({coverImage});" out:fade>
    <div
      class="centered"
      style:width="calc(min(500px, 100vw))"
      style:height="calc(min(500px, 100vh))"
      style:backdrop-filter="blur(5px) brightness(0.625)"
      style:box-shadow="0 4.41px 22.22px #00000099"
      style:border-radius="10px"
    />
    <div class="centered" style:text-align="center">
      <img alt="PROGEN FLARES 2" src={textLogo} width="321" draggable={false} />
      <br /><br />
      {#if !isPhotoshopPlugin && !isPhotopeaPlugin}
        <span style="width: 145px; text-align: left; display: inline-block;">Image Width</span>
        <input type="number" bind:value={flareSettings.dimensions.width} style="width: 80px;" />
        <br />
        <span style="width: 145px; text-align: left; display: inline-block;">Image Height</span>
        <input type="number" bind:value={flareSettings.dimensions.height} style="width: 80px;" />
        <br /><br />
        <button on:click={onStart}>Create</button>
        <br /><br />
      {/if}
      <span style="font-size: 10px;">&copy; 2026 Lunal Graphics<br />Developed by Yikuan Sun</span>
    </div>
  </div>
{/if}

<svelte:head>
  <title>Progen Flares 2</title>
</svelte:head>

<style>
  :root {
    --color-scheme-1: #f27700;
    --color-scheme-2: #d06100;
    --color-scheme-3: #a24200;
    --color-scheme-4: #712200;
    --color-scheme-5: #430300;
    --color-scheme-6: #242424;
  }

  :global(body) {
    background-color: var(--color-scheme-6);
    color: whitesmoke;
    user-select: none;
  }

  /* ─── Canvas ─────────────────────────────────────────────────── */

  #baseCanvas,
  #referenceImage {
    max-width: calc(100% - 50px);
    max-height: calc(100% - 50px);
  }

  #referenceImage {
    background-color: black;
    background-size: 100% 100%;
  }

  #baseCanvas {
    mix-blend-mode: screen;
  }

  /* ─── Form Controls ──────────────────────────────────────────── */

  :global(slider) {
    float: right;
    accent-color: var(--color-scheme-1);
  }

  :global(input[type="number"]) {
    color: var(--color-scheme-1);
    background-color: #181818;
    border: 1px solid #181818;
    transition: border 0.2s, box-shadow 0.2s;
    -moz-appearance: textfield;
  }

  :global(input[type="number"]):focus {
    border: 1px solid var(--color-scheme-1);
    box-shadow: inset 0 0 4px var(--color-scheme-2);
    outline: none !important;
    -moz-appearance: revert !important;
  }

  :global(input[type="number"]):hover {
    border: 1px solid var(--color-scheme-1);
    -moz-appearance: revert !important;
  }

  :global(button) {
    padding: 4px 12px;
    background-color: #333333;
    border: 1px solid #555555;
    color: var(--color-scheme-1);
    transition: border 0.2s, box-shadow 0.2s, background-color 0.2s;
  }

  :global(button):focus,
  :global(select):focus {
    border: 1px solid var(--color-scheme-1);
    box-shadow: inset 0 0 4px var(--color-scheme-2);
    outline: none !important;
  }

  :global(button):hover,
  :global(select):hover {
    border: 1px solid var(--color-scheme-1);
  }

  :global(select) {
    padding: 4px;
    background-color: #333333;
    border: 1px solid #555555;
    color: var(--color-scheme-1);
    transition: border 0.2s, box-shadow 0.2s;
  }

  :global(select),
  :global(button) {
    margin-bottom: 0;
  }

  :global(input[type="checkbox"]) {
    accent-color: var(--color-scheme-2);
  }

  /* ─── Range Slider ───────────────────────────────────────────── */

  :global(input[type="range"]) {
    -webkit-appearance: none;
    appearance: none;
    outline: none !important;
    background-color: #353535 !important;
    height: 5px !important;
    border: 0 !important;
  }

  :global(input[type="range"]::-webkit-slider-thumb) {
    -webkit-appearance: none;
    appearance: none;
    height: 10px !important;
    width: 10px !important;
    background-color: var(--color-scheme-1) !important;
    border-radius: 50%;
    border: 0 !important;
  }

  :global(input[type="range"]::-webkit-slider-thumb:hover) {
    background-color: var(--color-scheme-3) !important;
  }

  :global(input[type="range"]::-moz-range-thumb) {
    height: 10px !important;
    width: 10px !important;
    background-color: var(--color-scheme-1) !important;
    border-radius: 50%;
    border: 0 !important;
  }

  :global(input[type="range"]::-moz-range-thumb:hover) {
    background-color: var(--color-scheme-3) !important;
  }

  :global(.hueSlider input[type="range"]) {
    background: linear-gradient(
      to right,
      hsl(0, 100%, 25%),
      hsl(30deg, 100%, 25%),
      hsl(60deg, 100%, 25%),
      hsl(90deg, 100%, 25%),
      hsl(120deg, 100%, 25%),
      hsl(150deg, 100%, 25%),
      hsl(180deg, 100%, 25%),
      hsl(210deg, 100%, 25%),
      hsl(240deg, 100%, 25%),
      hsl(270deg, 100%, 25%),
      hsl(300deg, 100%, 25%),
      hsl(330deg, 100%, 25%),
      hsl(360deg, 100%, 25%)
    );
  }

  /* ─── Scrollbar ──────────────────────────────────────────────── */

  :global(::-webkit-scrollbar) {
    width: 10px;
    height: 10px;
  }

  :global(::-webkit-scrollbar-track) {
    opacity: 0;
  }

  :global(::-webkit-scrollbar-thumb) {
    background: #333333;
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: var(--color-scheme-3);
  }

  :global(::selection) {
    background-color: var(--color-scheme-4);
  }

  /* ─── Layout Panels ──────────────────────────────────────────── */

  #controlPanel {
    position: fixed;
    overflow-y: scroll;
    border-left: 1px solid #353535;
    right: 0;
  }

  #controlPanel[data-layout="horizontal"] {
    width: var(--divider-x);
    height: 100vh;
    bottom: 0;
  }

  #controlPanel[data-layout="vertical"] {
    width: 100vw;
    height: calc(var(--divider-y) - 50px);
    bottom: 50px;
  }

  #previewSection {
    box-sizing: border-box;
    padding: 25px;
    position: fixed;
    top: 50px;
    left: 0;
  }

  #previewSection[data-layout="horizontal"] {
    width: calc(100vw - var(--divider-x));
    height: calc(100vh - 2 * 50px);
  }

  #previewSection[data-layout="vertical"] {
    width: 100vw;
    height: calc(100vh - 50px - var(--divider-y));
  }

  .centered {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  #sectionAbovePreview {
    height: 50px;
    box-sizing: border-box;
    text-align: center;
    position: fixed;
    top: 0;
    left: 0;
  }

  #sectionAbovePreview[data-layout="horizontal"] {
    width: calc(100vw - var(--divider-x));
  }

  #sectionAbovePreview[data-layout="vertical"] {
    width: 100vw;
  }

  #exportPanel {
    height: 50px;
    box-sizing: border-box;
    text-align: center;
    position: fixed;
    bottom: 0;
    left: 0;
  }

  #exportPanel[data-layout="horizontal"] {
    width: calc(100vw - var(--divider-x));
  }

  #exportPanel[data-layout="vertical"] {
    width: 100vw;
  }

  #startScreen {
    width: 100vw;
    height: 100vh;
    background-color: var(--color-scheme-6);
    position: fixed;
    top: 0;
    left: 0;
    background-size: cover;
    background-position: center;
    z-index: 15;
  }

  .preset-bar {
    position: sticky;
    top: 0;
    width: 100%;
    background-color: var(--color-scheme-6);
    padding: 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #353535;
  }
</style>
