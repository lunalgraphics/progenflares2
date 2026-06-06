<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';
    import { slide } from "svelte/transition";
    import PlusMinus from "./PlusMinus.svelte";

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
    <PlusMinus
        color="white"
        size={9}
        plus={collapsed}
        style="margin-bottom: 1px; margin-left: 7px; margin-right: 5px;"
    ></PlusMinus>
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
        border-bottom: 1px solid #373737;
        padding: 10px 5px;
        box-sizing: border-box;
    }
    #contents {
        padding: 2px 5px 5px 25px;
        box-sizing: border-box;
        line-height: 27px;
        border-bottom: 1px solid #373737;
    }
</style>