<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher, onMount } from 'svelte';
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
    import genericanamorphic from "./builtinPresets/genericanamorphic.pgf2.json"
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
        { name: "Generic Anamorphic", data: genericanamorphic },
    ];

    function saveUserPresets() {
        if (isPhotoshopPlugin) {
            window.uxpHost.postMessage({
                type: "savePresets",
                data: userPresets,
            });
        }
        else {
            window.localStorage.setItem("userPresets", JSON.stringify(userPresets));
        }
    }

    function handleFileInput() {
        for (let file of this.files) {
            var fR = new FileReader();
            fR.addEventListener("loadend", function(e) {
                userPresets = [...userPresets, {
                    name: file.name,
                    data: JSON.parse(e.target.result),
                }];
                saveUserPresets();
            });
            fR.readAsText(file);
        }
        this.value = null;
    }

    export const defaultPreset = builtInPresets[0].data;
    export let isPhotoshopPlugin = false;

    let pickerOpen = false;
    let userPresets = [];

    onMount(() => {
        if (!isPhotoshopPlugin && window.localStorage.getItem("userPresets")) {
            userPresets = JSON.parse(window.localStorage.getItem("userPresets"));
        }
    });
</script>

<svelte:window on:message={(e) => {
    if (isPhotoshopPlugin && e.data.type == "loadPresets") {
        if (typeof e.data.data == "string") e.data.data = JSON.parse(e.data.data);
        userPresets = e.data.data;
    }
}} />

<button style="width: 49%;" on:click={() => { pickerOpen = true; }}>Apply Preset</button>

{#if pickerOpen}
    <div class="greywall"
        transition:fade
        on:mousedown={() => { pickerOpen = false; }}
    ></div>
    <div class="modal"
        transition:slide
    >
        <div style="width: 100%; height: 100%; overflow-y: scroll;">
            <div style="position: sticky; top: 0;">
                <div on:mousedown={() => {
                    fileInput.click();
                }} class="longButton" style="width: 50%; border-bottom-style: solid; border-right-style: solid;">Import Preset</div>
                <div on:mousedown={() => {
                    pickerOpen = false;
                }} class="longButton" style="width: 50%; float: right; border-bottom-style: solid;">Cancel</div>
            </div>
            <br />
            <b>Imported Presets</b>
            {#each userPresets as preset, i}
                <br />
                <div on:mousedown={() => {
                    dispatch("choose", preset["data"]);
                    pickerOpen = false;
                }} class="longButton" style="border-top-style: solid; width: calc(100% - 40px);">
                    {preset["name"]}
                </div>
                <div on:mousedown={() => {
                    userPresets = userPresets.filter((val, index) => {
                        return index != i;
                    });
                    saveUserPresets();
                }} class="longButton" style="border-top-style: solid; border-left-style: solid; width: 40px; float: right;">
                    -
                </div>
            {/each}
            <br />
            <br />
            <b>Built-in presets</b>
            {#each builtInPresets as preset}
                <br />
                <div on:mousedown={() => {
                    dispatch("choose", preset["data"]);
                    pickerOpen = false;
                }} class="longButton" style="border-top-style: solid;">
                    {preset["name"]}
                </div>
            {/each}
        </div>
    </div>
{/if}

<input type={"file"} bind:this={fileInput} on:change={handleFileInput} accept=".pgf2" multiple={true} />

<svelte:options accessors={true} />

<style>
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
        max-width: 100vw;
        max-height: 100vh;
        top: 50vh;
        left: 50vw;
        transform: translate(-50%, -50%);
        background-color: var(--color-scheme-6);
        border-radius: 8px;
        z-index: 37;
        padding: 16px;
    }

    .longButton {
        width: 100%;
        box-sizing: border-box;
        padding: 5px;
        border: 1px hidden #333333;
        text-align: center;
        display: inline-block;
        background-color: var(--color-scheme-6);
        color: whitesmoke;
        transition: background-color 0.2s;
    }

    .longButton:hover {
        background-color: #333333;
        cursor: pointer;
    }
</style>