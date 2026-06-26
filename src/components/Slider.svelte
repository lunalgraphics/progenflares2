<!--
  Slider component combining a range input and a number input.
  Both inputs stay in sync and emit input/change events.
-->
<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  /** @type {number} Current slider value */
  export let value;
  /** @type {number} Minimum value */
  export let min = 0;
  /** @type {number} Maximum value */
  export let max;
  /** @type {number} Step increment */
  export let step = 1;
  /** @type {string|null} Optional CSS class for the wrapper */
  export let className = null;

  function handleInput() {
    dispatch("input");
  }

  function handleChange() {
    dispatch("change");
  }

  let wheelStopTimeout = null;
  function handleWheel(e) {
    if (document.activeElement !== e.target) return; // Only if the input has the focus
    e.preventDefault(); // prevent page scrolling

    // debounce
    clearTimeout(wheelStopTimeout);

    if (e.deltaY < 0) {
      value += step; // wheel up
    } else {
      value -= step; // wheel down
    }

    // bind value - I've left it commented out because you may want to go beyond the max/min values
    // e.g. place flare outside of document, or make it bigger than normal
    // value = Math.min(max, Math.max(min, value));

    handleInput();

    // trigger on:change when interaction stopped (only really used for scale multiplier but it's nice to have)
    wheelStopTimeout = setTimeout(() => {
      handleChange();
    }, 500);
  }
</script>

<slider class={className}>
  <input
    type="range"
    {min}
    {max}
    {step}
    bind:value
    on:input={handleInput}
    on:change={handleChange}
  />
  <input
    type="number"
    {step}
    bind:value
    on:input={handleInput}
    on:change={handleChange}
    on:wheel={handleWheel}
  />
</slider>

<svelte:options accessors={true} />

<style>
  slider {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  input[type="number"] {
    width: 54px;
    flex-shrink: 0;
    font-size: 12px;
    padding: 3px;
    outline: none !important;
    margin-bottom: 0 !important;
  }

  input[type="range"] {
    padding: 0;
    margin: 0;
    vertical-align: middle;
    flex: 1;
    min-width: 0;
  }
</style>
