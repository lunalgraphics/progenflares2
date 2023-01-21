<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let title;
</script>

<h1>{title}</h1>
<slot>
    <div></div>
</slot>