<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';
    import sundigital from "./builtinPresets/sundigital.pgf2.json";
    import simplecyan from "./builtinPresets/simplecyan.pgf2.json";
    import flamboyantanamorphic from "./builtinPresets/flamboyantanamorphic.pgf2.json";
    import seaoffog from "./builtinPresets/seaoffog.pgf2.json";
    import interstellar from "./builtinPresets/interstellar.pgf2.json";
    import sunflower from "./builtinPresets/sunflower.pgf2.json";
    import daisysbeacon from "./builtinPresets/daisysbeacon.pgf2.json";
    import bluedwarf from "./builtinPresets/bluedwarf.pgf2.json";
    import clairdelune from "./builtinPresets/clairdelune.pgf2.json";
    import goldencentury from "./builtinPresets/goldencentury.pgf2.json";
    import industrialanamorphic from "./builtinPresets/industrialanamorphic.pgf2.json";
    import hexastar from "./builtinPresets/hexastar.pgf2.json";
    import lasermeme from "./builtinPresets/lasermeme.pgf2.json";
    import cherrytree from "./builtinPresets/cherrytree.pgf2.json";
    import ancientmariner from "./builtinPresets/ancientmariner.pgf2.json";
    import lemonlight from "./builtinPresets/lemonlight.pgf2.json";
    import { fade, slide } from 'svelte/transition';

    const dispatch = createEventDispatcher();

    let dropdown;
    let fileInput;

    var builtInPresets = [
        { name: "Sun Digital", data: sundigital },
        { name: "Simple Cyan", data: simplecyan },
        { name: "Flamboyant Anamorphic", data: flamboyantanamorphic },
        { name: "Sea of Fog", data: seaoffog },
        { name: "Interstellar", data: interstellar },
        { name: "Sunflower", data: sunflower },
        { name: "Daisy's Beacon", data: daisysbeacon },
        { name: "Blue Dwarf", data: bluedwarf },
        { name: "Clair de Lune", data: clairdelune },
        { name: "Golden Century", data: goldencentury },
        { name: "Industrial Anamorphic", data: industrialanamorphic },
        { name: "Hexastar", data: hexastar },
        { name: "Laser Meme", data: lasermeme },
        { name: "Cherry Tree", data: cherrytree },
        { name: "Ancient Mariner", data: ancientmariner },
        { name: "Lemon Light", data: lemonlight },
    ];

    function handleFileInput() {
        var file = this.files[0];
        var fR = new FileReader();
        fR.addEventListener("loadend", function(e) {
            dispatch("choose", JSON.parse(e.target.result));
        });
        fR.readAsText(file);
        this.value = null;
        pickerOpen = false;
    }

    export const defaultPreset = builtInPresets[0].data;

    let pickerOpen = false;
</script>

<button style="width: 49%;" on:click={() => { pickerOpen = true; }}>Use a Preset</button>

{#if pickerOpen}
    <div class="greywall"
        transition:fade
        on:mousedown={() => { pickerOpen = false; }}
    ></div>
    <div class="modal"
        transition:slide
    >
        <div style="width: 100%; height: 100%; overflow-y: scroll;">
            <button on:click={() => {
                fileInput.click();
            }}>
                Import .pgf2 file
            </button>
            <br />
            <b>Built-in presets</b>
            {#each builtInPresets as preset}
                <br />
                <button on:click={() => {
                    dispatch("choose", preset["data"]);
                    pickerOpen = false;
                }}>
                    {preset["name"]}
                </button>
            {/each}
        </div>
    </div>
{/if}

<input type={"file"} bind:this={fileInput} on:change={handleFileInput} accept=".pgf2" />

<svelte:options accessors={true} />

<style>
    select {
        outline: none;
        width: 200px;
    }

    input[type=file] {
        display: none;
    }

    .greywall {
        position: fixed;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        background-color: black;
        opacity: 0.75;
        z-index: 36;
    }

    .modal {
        position: fixed;
        width: 500px;
        height: 300px;
        top: 50vh;
        left: 50vw;
        transform: translate(-50%, -50%);
        background-color: var(--color-scheme-6);
        border-radius: 8px;
        z-index: 37;
        padding: 16px;
    }
</style>