<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let dropdown;
    let fileInput;

    var builtInPresets = [
        { name: "hi", data: {} },
        { name: "hello", data: {} },
        { name: "Sea of Fog", data: {"hotspot":{"radius":372,"intensity":37,"deformationAmount":0.76,"deformationFrequency":0.01,"deformationSeed":157,"alpha":100,"angle":0,"hue":287,"saturation":48,"anamorph":0},"streak":{"thickness":81,"width":2145,"intensity":10,"count":1,"angle":0,"shift":45,"alpha":100,"hue":279,"saturation":54},"ring":{"radius":356,"thickness":42,"blur":4,"cropSize":543,"cropHardness":35,"alpha":100,"hue":281,"saturation":67,"anamorph":0},"miIris":{"radius":81,"sides":5,"roundness":20,"angle":54,"fillAlpha":21,"fringeAlpha":21,"fringeSize":19,"blur":3,"countAway":5,"countTowards":12,"spread":30,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":338,"hue":283,"saturation":100,"anamorph":0},"glow":{"radius":1101,"alpha":20,"softening":70,"hue":281,"saturation":100,"anamorph":0}} },
    ];

    function handleChange() {
        if (this.value == "UPLOAD_PRESET") {
            fileInput.click();
        }
        else {
            dispatch("choose", JSON.parse(this.value));
        }
        this.value = "";
    }

    function handleFileInput() {
        var file = this.files[0];
        var fR = new FileReader();
        fR.addEventListener("loadend", function(e) {
            dispatch("choose", JSON.parse(e.target.result));
        });
        fR.readAsText(file);
    }
</script>

<select bind:this={dropdown} on:change={handleChange}>
    <option value={""} selected disabled hidden>Use a Preset</option>
    <option value={"UPLOAD_PRESET"}>Import .pgf2 file</option>
    <optgroup label={"Built-In Presets"}>
        {#each builtInPresets as preset}
            <option value={JSON.stringify(preset.data)}>{preset.name}</option>
        {/each}
    </optgroup>
</select>

<input type={"file"} bind:this={fileInput} on:change={handleFileInput} />

<style>
    select {
        outline: none;
    }

    input[type=file] {
        display: none;
    }
</style>