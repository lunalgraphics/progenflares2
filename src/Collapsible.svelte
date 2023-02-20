<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';
    import { slide } from "svelte/transition";

    const dispatch = createEventDispatcher();

    export let title;
    export let collapsed = true;

    let nameTag;
    let contents;

    function toggleCollapse() {
        collapsed = !collapsed;
    }
</script>

<div id={"nameTag"} on:mousedown={toggleCollapse}>
    <div style={"width: 18px; text-align: center; display: inline-block;"}>
        {collapsed?"+":"-"}
    </div>
    <b>{title}</b>
</div>

{#if (!collapsed)}
    <div id={"contents"} in:slide out:slide>
        <slot></slot>
    </div>
{/if}

<style>
    #nameTag {
        user-select: none;
        border-bottom: 1px solid grey;
        padding: 10px 5px;
        box-sizing: border-box;
    }
    #contents {
        padding: 2px 2px 5px 25px;
        box-sizing: border-box;
        line-height: 25px;
    }
</style>