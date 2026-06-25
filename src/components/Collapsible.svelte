<!--
  Collapsible section component.
  Renders a clickable header that toggles visibility of its slot content
  with a slide transition.
-->

<script>
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import PlusMinus from "./PlusMinus.svelte";

  const dispatch = createEventDispatcher();

  /** @type {string} Section title displayed in the header */
  export let title;
  /** @type {boolean} Whether the section starts collapsed */
  export let collapsed = true;

  function toggleCollapse() {
    collapsed = !collapsed;
  }
</script>

<div class="name-tag" on:mousedown={toggleCollapse}>
  <PlusMinus
    color="white"
    size={9}
    plus={collapsed}
    style="margin-bottom: 1px; margin-left: 7px; margin-right: 5px;"
  />
  <b>{title}</b>
</div>

{#if !collapsed}
  <div class="contents" in:slide out:slide>
    <slot />
  </div>
{/if}

<style>
  .name-tag {
    user-select: none;
    border-bottom: 1px solid #373737;
    padding: 10px 5px;
    box-sizing: border-box;
  }

  .contents {
    display: grid;
    grid-template-columns: 14ch 1fr; /* Adjust 12ch based on length of longest text label */ 
    align-items: center;
    row-gap: 2px;
    column-gap: 5px;
    padding: 2px 5px 5px 25px;
    box-sizing: border-box;
    line-height: 27px;
    border-bottom: 1px solid #373737;
  }

  .contents > :global(label) {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    align-items: center;
  }

  .contents > :global(label[style*="text-align: center"]) {
    display: block;
    text-align: center;
  }
</style>
