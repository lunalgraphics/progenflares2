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
