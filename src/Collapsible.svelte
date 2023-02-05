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

<b bind:this={nameTag} on:mousedown={toggleCollapse} style="user-select: none;">{title}</b>
<br />
{#if (!collapsed)}
    <div bind:this={contents} in:slide out:slide>
        <slot></slot>
    </div>
{/if}