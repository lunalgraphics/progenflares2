<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let dropdown;
    let fileInput;

    var builtInPresets = [
        { name: "Sun Digital", data: {"hotspot":{"radius":595,"intensity":19,"deformationAmount":1.5,"deformationFrequency":0.01,"deformationSeed":239,"alpha":100,"angle":0,"hue":39,"saturation":88,"anamorph":0},"streak":{"thickness":121,"width":2435,"intensity":-25,"count":1,"angle":0,"shift":48,"alpha":100,"hue":216,"saturation":100},"ring":{"radius":300,"thickness":50,"blur":4,"cropSize":0,"cropHardness":50,"alpha":0,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":81,"sides":6,"roundness":32,"angle":0,"fillAlpha":12,"fringeAlpha":25,"fringeSize":10,"blur":4,"countAway":5,"countTowards":12,"spread":30,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":333,"hue":39,"saturation":100,"hueVariance":40,"anamorph":0},"glow":{"radius":999,"alpha":25,"softening":0,"hue":23,"saturation":100,"anamorph":0}} },
        { name: "Simple Cyan", data: {"hotspot":{"radius":500,"intensity":5,"deformationAmount":1.6,"deformationFrequency":0.006,"deformationSeed":1,"alpha":100,"angle":0,"hue":200,"saturation":100,"anamorph":0},"streak":{"thickness":64,"width":1600,"intensity":5,"count":1,"angle":0,"shift":36,"alpha":100,"hue":200,"saturation":100},"ring":{"radius":200,"thickness":40,"blur":5,"cropSize":0,"cropHardness":50,"alpha":21,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":81,"sides":5,"roundness":20,"angle":0,"fillAlpha":25,"fringeAlpha":50,"fringeSize":10,"blur":4,"countAway":5,"countTowards":12,"spread":30,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":123,"hue":200,"saturation":100,"hueVariance":30,"anamorph":0},"glow":{"radius":960,"alpha":50,"softening":70,"hue":200,"saturation":100,"anamorph":0}} },
        { name: "Flamboyant Anamorphic", data: {"hotspot":{"radius":802,"intensity":16,"deformationAmount":1.6,"deformationFrequency":0.006,"deformationSeed":1,"alpha":100,"angle":0,"hue":36,"saturation":100,"anamorph":42},"streak":{"thickness":95,"width":3210,"intensity":5,"count":1,"angle":0,"shift":54,"alpha":100,"hue":29,"saturation":81},"ring":{"radius":333,"thickness":67,"blur":7,"cropSize":0,"cropHardness":23,"alpha":16,"hue":12,"saturation":100,"anamorph":42},"miIris":{"radius":84,"sides":8,"roundness":24,"angle":24,"fillAlpha":17,"fringeAlpha":41,"fringeSize":10,"blur":4,"countAway":8,"countTowards":15,"spread":25,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":285,"hue":29,"saturation":100,"hueVariance":44,"anamorph":35},"glow":{"radius":1117,"alpha":44,"softening":26,"hue":10,"saturation":100,"anamorph":0}} },
        { name: "Sea of Fog", data: {"hotspot":{"radius":372,"intensity":21,"deformationAmount":0.76,"deformationFrequency":0.01,"deformationSeed":157,"alpha":100,"angle":0,"hue":287,"saturation":48,"anamorph":0},"streak":{"thickness":81,"width":2145,"intensity":10,"count":1,"angle":0,"shift":45,"alpha":100,"hue":279,"saturation":54},"ring":{"radius":356,"thickness":42,"blur":4,"cropSize":543,"cropHardness":35,"alpha":100,"hue":281,"saturation":67,"anamorph":0},"miIris":{"radius":81,"sides":5,"roundness":20,"angle":54,"fillAlpha":21,"fringeAlpha":21,"fringeSize":19,"blur":3,"countAway":5,"countTowards":12,"spread":30,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":342,"hue":283,"saturation":100,"hueVariance":20,"anamorph":0},"glow":{"radius":1101,"alpha":20,"softening":70,"hue":281,"saturation":100,"anamorph":0}} },
        { name: "Interstellar", data: {"hotspot":{"radius":288,"intensity":12,"deformationAmount":0.87,"deformationFrequency":0.01,"deformationSeed":290,"alpha":100,"angle":0,"hue":31,"saturation":49,"anamorph":0},"streak":{"thickness":46,"width":1028,"intensity":-10,"count":5,"angle":21,"shift":18,"alpha":100,"hue":47,"saturation":14},"ring":{"radius":200,"thickness":40,"blur":5,"cropSize":0,"cropHardness":50,"alpha":0,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":81,"sides":5,"roundness":42,"angle":55,"fillAlpha":9,"fringeAlpha":21,"fringeSize":10,"blur":4,"countAway":8,"countTowards":15,"spread":28,"sizeVariance":53,"perspective":100,"alphaVariance":71,"seed":342,"hue":222,"saturation":26,"hueVariance":102,"anamorph":0},"glow":{"radius":1064,"alpha":44,"softening":70,"hue":188,"saturation":58,"anamorph":0}} },
        { name: "Sunflower", data: {"hotspot":{"radius":476,"intensity":15,"deformationAmount":1.6,"deformationFrequency":0.015,"deformationSeed":109,"alpha":100,"angle":0,"hue":36,"saturation":25,"anamorph":0},"streak":{"thickness":64,"width":1600,"intensity":5,"count":1,"angle":0,"shift":36,"alpha":0,"hue":200,"saturation":100},"ring":{"radius":281,"thickness":40,"blur":12,"cropSize":0,"cropHardness":50,"alpha":14,"hue":52,"saturation":28,"anamorph":0},"miIris":{"radius":59,"sides":5,"roundness":100,"angle":0,"fillAlpha":10,"fringeAlpha":21,"fringeSize":17,"blur":2,"countAway":7,"countTowards":15,"spread":18,"sizeVariance":50,"perspective":100,"alphaVariance":100,"seed":117,"hue":60,"saturation":40,"hueVariance":82,"anamorph":0},"glow":{"radius":935,"alpha":50,"softening":70,"hue":34,"saturation":45,"anamorph":0}} },
        { name: "Daisy's Beacon", data: {"hotspot":{"radius":352,"intensity":12,"deformationAmount":1,"deformationFrequency":0.007,"deformationSeed":497,"alpha":100,"angle":0,"hue":81,"saturation":100,"anamorph":0},"streak":{"thickness":64,"width":1600,"intensity":5,"count":1,"angle":0,"shift":36,"alpha":0,"hue":200,"saturation":100},"ring":{"radius":270,"thickness":40,"blur":8,"cropSize":0,"cropHardness":50,"alpha":7,"hue":125,"saturation":100,"anamorph":0},"miIris":{"radius":41,"sides":10,"roundness":100,"angle":0,"fillAlpha":40,"fringeAlpha":0,"fringeSize":10,"blur":15,"countAway":5,"countTowards":12,"spread":25,"sizeVariance":58,"perspective":0,"alphaVariance":100,"seed":470,"hue":165,"saturation":100,"hueVariance":12,"anamorph":0},"glow":{"radius":960,"alpha":44,"softening":70,"hue":122,"saturation":100,"anamorph":0}} },
        { name: "Blue Dwarf", data: {"hotspot":{"radius":611,"intensity":16,"deformationAmount":1.6,"deformationFrequency":0.01,"deformationSeed":157,"alpha":100,"angle":0,"hue":204,"saturation":100,"anamorph":50},"streak":{"thickness":83,"width":3210,"intensity":10,"count":1,"angle":0,"shift":36,"alpha":100,"hue":214,"saturation":100},"ring":{"radius":400,"thickness":74,"blur":13,"cropSize":0,"cropHardness":50,"alpha":8,"hue":230,"saturation":100,"anamorph":50},"miIris":{"radius":73,"sides":6,"roundness":45,"angle":0,"fillAlpha":20,"fringeAlpha":30,"fringeSize":10,"blur":5,"countAway":7,"countTowards":12,"spread":30,"sizeVariance":27,"perspective":100,"alphaVariance":81,"seed":271,"hue":211,"saturation":100,"hueVariance":36,"anamorph":50},"glow":{"radius":960,"alpha":57,"softening":12,"hue":212,"saturation":100,"anamorph":0}} },
        { name: "Space Song", data: {"hotspot":{"radius":550,"intensity":11,"deformationAmount":1.6,"deformationFrequency":0.013,"deformationSeed":139,"alpha":100,"angle":0,"hue":200,"saturation":19,"anamorph":0},"streak":{"thickness":84,"width":2661,"intensity":12,"count":1,"angle":0,"shift":50,"alpha":100,"hue":204,"saturation":100},"ring":{"radius":325,"thickness":37,"blur":9,"cropSize":0,"cropHardness":50,"alpha":8,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":60,"sides":6,"roundness":45,"angle":0,"fillAlpha":12,"fringeAlpha":11,"fringeSize":12,"blur":3,"countAway":7,"countTowards":14,"spread":40,"sizeVariance":30,"perspective":100,"alphaVariance":50,"seed":520,"hue":210,"saturation":100,"hueVariance":36,"anamorph":15},"glow":{"radius":1200,"alpha":28,"softening":0,"hue":205,"saturation":100,"anamorph":0}} },
        { name: "Golden Century", data: {"hotspot":{"radius":632,"intensity":11,"deformationAmount":1.42,"deformationFrequency":0.012,"deformationSeed":216,"alpha":94,"angle":0,"hue":45,"saturation":100,"anamorph":0},"streak":{"thickness":92,"width":3210,"intensity":0,"count":1,"angle":0,"shift":36,"alpha":100,"hue":42,"saturation":100},"ring":{"radius":406,"thickness":44,"blur":6,"cropSize":392,"cropHardness":62,"alpha":25,"hue":27,"saturation":100,"anamorph":50},"miIris":{"radius":152,"sides":5,"roundness":100,"angle":0,"fillAlpha":25,"fringeAlpha":0,"fringeSize":10,"blur":30,"countAway":9,"countTowards":16,"spread":19,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":342,"hue":42,"saturation":100,"hueVariance":16,"anamorph":88},"glow":{"radius":1082,"alpha":39,"softening":26,"hue":45,"saturation":100,"anamorph":0}} },
        { name: "Industrial Anamorphic", data: {"hotspot":{"radius":531,"intensity":35,"deformationAmount":0,"deformationFrequency":0.006,"deformationSeed":1,"alpha":100,"angle":0,"hue":25,"saturation":21,"anamorph":60},"streak":{"thickness":115,"width":2695,"intensity":-12,"count":1,"angle":0,"shift":36,"alpha":100,"hue":222,"saturation":100},"ring":{"radius":200,"thickness":40,"blur":5,"cropSize":0,"cropHardness":50,"alpha":0,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":121,"sides":5,"roundness":100,"angle":0,"fillAlpha":25,"fringeAlpha":0,"fringeSize":10,"blur":30,"countAway":8,"countTowards":18,"spread":30,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":123,"hue":222,"saturation":100,"hueVariance":30,"anamorph":72},"glow":{"radius":1111,"alpha":45,"softening":0,"hue":21,"saturation":100,"anamorph":37}} },
        { name: "Hexastar", data: {"hotspot":{"radius":345,"intensity":5,"deformationAmount":2.1,"deformationFrequency":0.015,"deformationSeed":633,"alpha":100,"angle":0,"hue":200,"saturation":0,"anamorph":0},"streak":{"thickness":42,"width":1212,"intensity":12,"count":3,"angle":0,"shift":0,"alpha":100,"hue":200,"saturation":0},"ring":{"radius":200,"thickness":40,"blur":5,"cropSize":0,"cropHardness":50,"alpha":0,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":64,"sides":6,"roundness":45,"angle":0,"fillAlpha":10,"fringeAlpha":10,"fringeSize":25,"blur":3,"countAway":10,"countTowards":19,"spread":20,"sizeVariance":40,"perspective":100,"alphaVariance":64,"seed":397,"hue":200,"saturation":20,"hueVariance":180,"anamorph":0},"glow":{"radius":960,"alpha":48,"softening":70,"hue":196,"saturation":24,"anamorph":0}} },
        { name: "Laser Meme", data: {"hotspot":{"radius":591,"intensity":12,"deformationAmount":2.1,"deformationFrequency":0.007,"deformationSeed":611,"alpha":100,"angle":0,"hue":14,"saturation":100,"anamorph":56},"streak":{"thickness":64,"width":3210,"intensity":5,"count":1,"angle":0,"shift":50,"alpha":100,"hue":14,"saturation":100},"ring":{"radius":200,"thickness":40,"blur":5,"cropSize":0,"cropHardness":50,"alpha":0,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":49,"sides":5,"roundness":100,"angle":0,"fillAlpha":26,"fringeAlpha":32,"fringeSize":10,"blur":4,"countAway":9,"countTowards":16,"spread":30,"sizeVariance":48,"perspective":100,"alphaVariance":100,"seed":556,"hue":25,"saturation":100,"hueVariance":25,"anamorph":56},"glow":{"radius":960,"alpha":50,"softening":70,"hue":9,"saturation":100,"anamorph":0}} },
        { name: "Cherry Tree", data: {"hotspot":{"radius":443,"intensity":5,"deformationAmount":1.6,"deformationFrequency":0.006,"deformationSeed":1,"alpha":100,"angle":0,"hue":325,"saturation":100,"anamorph":0},"streak":{"thickness":99,"width":3232,"intensity":5,"count":1,"angle":0,"shift":50,"alpha":100,"hue":284,"saturation":100},"ring":{"radius":462,"thickness":83,"blur":9,"cropSize":443,"cropHardness":82,"alpha":21,"hue":298,"saturation":100,"anamorph":0},"miIris":{"radius":57,"sides":8,"roundness":42,"angle":0,"fillAlpha":16,"fringeAlpha":32,"fringeSize":30,"blur":4,"countAway":8,"countTowards":16,"spread":30,"sizeVariance":47,"perspective":100,"alphaVariance":50,"seed":315,"hue":292,"saturation":100,"hueVariance":25,"anamorph":0},"glow":{"radius":960,"alpha":50,"softening":70,"hue":279,"saturation":100,"anamorph":0}} },
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
        this.value = null;
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