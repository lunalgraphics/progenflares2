<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let title;
    export let collapsed = false;

    let nameTag;
    let contents;

    function toggleCollapse() {
        collapsed = !collapsed;
    }
</script>

<b bind:this={nameTag} on:mousedown={toggleCollapse} style="user-select: none;">{title}</b>
<br />
<div bind:this={contents} style="display: {collapsed?"none":"block"};">
    <slot></slot>
</div>