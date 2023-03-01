<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let dropdown;
    let fileInput;

    var builtInPresets = [
        { name: "Sun Digital", data: {"hotspot":{"radius":595,"intensity":19,"deformationAmount":1.5,"deformationFrequency":0.01,"deformationSeed":998,"alpha":100,"angle":0,"hue":39,"saturation":88,"anamorph":0},"streak":{"thickness":121,"width":2435,"intensity":-25,"count":1,"angle":0,"shift":48,"alpha":100,"hue":216,"saturation":100},"ring":{"radius":300,"thickness":50,"blur":4,"cropSize":0,"cropHardness":50,"alpha":0,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":81,"sides":6,"roundness":32,"angle":0,"fillAlpha":12,"fringeAlpha":25,"fringeSize":10,"blur":4,"countAway":5,"countTowards":12,"spread":30,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":131,"hue":39,"saturation":100,"anamorph":0},"glow":{"radius":999,"alpha":25,"softening":0,"hue":23,"saturation":100,"anamorph":0}} },
        { name: "Simple Cyan", data: {"hotspot":{"radius":500,"intensity":5,"deformationAmount":1.6,"deformationFrequency":0.006,"deformationSeed":1,"alpha":100,"angle":0,"hue":200,"saturation":100,"anamorph":0},"streak":{"thickness":64,"width":1600,"intensity":5,"count":1,"angle":0,"shift":36,"alpha":100,"hue":200,"saturation":100},"ring":{"radius":200,"thickness":40,"blur":5,"cropSize":0,"cropHardness":50,"alpha":21,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":81,"sides":5,"roundness":20,"angle":0,"fillAlpha":25,"fringeAlpha":50,"fringeSize":10,"blur":4,"countAway":5,"countTowards":12,"spread":30,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":123,"hue":200,"saturation":100,"anamorph":0},"glow":{"radius":960,"alpha":80,"softening":70,"hue":200,"saturation":100,"anamorph":0}} },
        { name: "Flamboyant Anamorphic", data: {"hotspot":{"radius":802,"intensity":16,"deformationAmount":1.6,"deformationFrequency":0.006,"deformationSeed":1,"alpha":100,"angle":0,"hue":36,"saturation":100,"anamorph":42},"streak":{"thickness":95,"width":3210,"intensity":5,"count":1,"angle":0,"shift":54,"alpha":100,"hue":29,"saturation":81},"ring":{"radius":333,"thickness":67,"blur":7,"cropSize":0,"cropHardness":23,"alpha":16,"hue":12,"saturation":100,"anamorph":42},"miIris":{"radius":84,"sides":8,"roundness":24,"angle":24,"fillAlpha":17,"fringeAlpha":41,"fringeSize":10,"blur":4,"countAway":8,"countTowards":15,"spread":25,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":285,"hue":29,"saturation":100,"anamorph":35},"glow":{"radius":1117,"alpha":44,"softening":26,"hue":10,"saturation":100,"anamorph":0}} },
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
        width: 200px;
    }

    input[type=file] {
        display: none;
    }
</style>