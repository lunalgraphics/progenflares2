<script>
    /** @type {"horizontal" | "vertical"} */
    export let layout = "horizontal";
    // X and Y are with respect to left and bottom it determines size of control panel
    export let dividerX = 360;
    export let dividerY = 360;
    // clamp possible x and y values
    export let minX = 360;
    export let minY = 360;

    let dragging = false;

    function handlePointerDown() {
        dragging = true;
    }

    function handlePointerMove(e) {
        if (dragging) {
            if (layout == "horizontal") {
                dividerX = window.innerWidth - e.pageX;
                dividerX = Math.max(minX, Math.min(window.innerWidth, dividerX));
            } else {
                dividerY = window.innerHeight - e.pageY;
                dividerY = Math.max(minY, Math.min(window.innerHeight, dividerY));
            }
        }
    }

    function handlePointerUp() {
        dragging = false;
    }
</script>

<svelte:window on:pointermove={handlePointerMove} on:pointerup={handlePointerUp} />

<div id="divider" data-layout={layout} style:--divider-x="{dividerX}px" style:--divider-y="{dividerY}px"
    on:pointerdown={handlePointerDown}></div>

<style>
    #divider {
        position: fixed;
        background-color: #353535;
        pointer-events: all;
        z-index: 2;
        --divider-size: 5px;
    }

    #divider:hover {
        background-color: #555555;
    }

    /* CSS variable trick to change divider orientation */
    #divider[data-layout="horizontal"] {
        height: 100vh;
        width: var(--divider-size);
        cursor: ew-resize;
        bottom: 0;
        right: var(--divider-x);
        transform: translateX(50%);
    }

    #divider[data-layout="vertical"] {
        height: var(--divider-size);
        width: 100vw;
        cursor: ns-resize;
        bottom: var(--divider-y);
        right: 0;
        transform: translateY(50%);
    }
</style>