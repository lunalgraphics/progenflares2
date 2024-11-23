<script>
    import Collapsible from "./Collapsible.svelte";
    import colorvibrance from "./colorvibrance";
    import SpotComponent from "./SpotComponent";
    import RingComponent from "./RingComponent";
    import Slider from "./Slider.svelte";
    import drawComponent from "./drawComponent";
    import canvasClickDrag from "./canvasClickDrag";
    import IrisComponent from "./IrisComponent";
    import seedrandom from "../node_modules/seedrandom";
    import HalfComponent from "./HalfComponent";
    import PresetPicker from "./PresetPicker.svelte";
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import textLogo from "./images/textLogo.png";
    import coverImage from "./images/coverImage.jpg";

    var flareComponents = {
        hotspot: new SpotComponent(256, {
            deformationFrequency: 0.006,
        }),
        streak: new SpotComponent(256, {
            deformationAmount: 0,
            intensity: 0,
        }),
        ring: new RingComponent(256, {
            cropSize: 0,
        }),
        miIris: new IrisComponent(256, {
            roundness: 20,
        }),
        glow: new SpotComponent(256, {
            deformationAmount: 0,
            intensity: -50,
        }),
        lensOrbs: new IrisComponent(256, {}),
    };

    var flareSettings = {
        downscaling: 5/2,
        exportType: "png",
        sizeMultiplier: 1,
        dimensions: {
            width: 1920,
            height: 1080,
        },
        positioning: {
            x: 960,
            y: 540,
            pivotX: 960,
            pivotY: 540,
        },
        hotspot: {
            visible: true,
            radius: 500,
            intensity: 5,
            deformationAmount: 1.6,
            deformationFrequency: 0.006,
            deformationSeed: 1,
            deformationOctaves: 10,
            alpha: 100,
            angle: 0,
            hue: 200,
            saturation: 100,
            anamorph: 0,
        },
        streak: {
            visible: true,
            thickness: 64,
            width: 1600,
            intensity: 5,
            count: 1,
            angle: 0,
            shift: 36,
            alpha: 100,
            angle: 0,
            hue: 200,
            saturation: 100,
        },
        ring: {
            visible: true,
            radius: 200,
            thickness: 40,
            blur: 5,
            cropSize: 0,
            cropHardness: 50,
            alpha: 21,
            hue: 200,
            saturation: 100,
            anamorph: 0,
        },
        miIris: {
            visible: true,
            radius: 81,
            sides: 5,
            roundness: 20,
            angle: 0,
            fillAlpha: 25,
            fringeAlpha: 50,
            fringeSize: 10,
            blur: 4,
            countAway: 5,
            countTowards: 12,
            spread: 30,
            sizeVariance: 40,
            perspective: 100,
            alphaVariance: 50,
            seed: 123,
            hue: 200,
            saturation: 100,
            hueVariance: 30,
            anamorph: 0,
        },
        glow: {
            visible: true,
            radius: 960,
            alpha: 50,
            softening: 70,
            hue: 200,
            saturation: 100,
            anamorph: 0,
        },
        lensOrbs: {
            visible: true,
            radius: 45,
            sides: 6,
            roundness: 100,
            angle: 0,
            fillAlpha: 8,
            fringeAlpha: 11,
            fringeSize: 17,
            blur: 5,
            count: 100,
            threshold: 1200,
            seed: 124,
            sizeVariance: 0,
            alphaVariance: 50,
            hue: 200,
            saturation: 100,
            hueVariance: 360,
            anamorph: 0,
        },
    };

    var baseCanvas, referenceImage;
    
    function renderFlare(renderHotspot=false, renderStreak=false, renderRing=false, renderMI=false, renderGlow=false, renderLensOrbs=false) {
        if (renderHotspot) {
            flareComponents.hotspot.radius = Math.floor(flareSettings.hotspot.radius / flareSettings.downscaling);
            flareComponents.hotspot.options.intensity = flareSettings.hotspot.intensity;
            flareComponents.hotspot.options.deformationAmount = flareSettings.hotspot.deformationAmount;
            flareComponents.hotspot.options.deformationFrequency = flareSettings.hotspot.deformationFrequency;
            flareComponents.hotspot.options.deformationSeed = flareSettings.hotspot.deformationSeed;
            flareComponents.hotspot.options.deformationOctaves = flareSettings.hotspot.deformationOctaves;
            flareComponents.hotspot.options.hue = flareSettings.hotspot.hue;
            flareComponents.hotspot.options.saturation = flareSettings.hotspot.saturation;
            flareComponents.hotspot.options.angle = flareSettings.hotspot.angle;
            flareComponents.hotspot.render();
        }
        if (renderStreak) {
            flareComponents.streak.radius = Math.floor(flareSettings.streak.thickness * 2 / flareSettings.downscaling);
            flareComponents.streak.options.intensity = flareSettings.streak.intensity;
            flareComponents.streak.options.hue = flareSettings.streak.hue;
            flareComponents.streak.options.saturation = flareSettings.streak.saturation;
            flareComponents.streak.render();
            flareComponents.streakLeftHalf = new HalfComponent(flareComponents.streak.canvas, flareSettings.streak.width * 2, flareSettings.streak.thickness * 2, true, false);
            flareComponents.streakRightHalf = new HalfComponent(flareComponents.streak.canvas, flareSettings.streak.width * 2, flareSettings.streak.thickness * 2, false, true);
        }
        if (renderRing) {
            flareComponents.ring.radius = Math.floor(flareSettings.ring.radius / flareSettings.downscaling);
            flareComponents.ring.options.thickness = flareSettings.ring.thickness / flareSettings.downscaling;
            flareComponents.ring.options.blur = flareSettings.ring.blur / flareSettings.downscaling;
            flareComponents.ring.options.cropSize = flareSettings.ring.cropSize / flareSettings.downscaling;
            flareComponents.ring.options.cropHardness = flareSettings.ring.cropHardness;
            flareComponents.ring.options.hue = flareSettings.ring.hue;
            flareComponents.ring.options.saturation = flareSettings.ring.saturation;
            flareComponents.ring.render();
        }
        if (renderMI) {
            flareComponents.miIris.radius = Math.floor(flareSettings.miIris.radius / flareSettings.downscaling);
            flareComponents.miIris.options.sides = flareSettings.miIris.sides;
            flareComponents.miIris.options.roundness = flareSettings.miIris.roundness;
            flareComponents.miIris.options.fillAlpha = flareSettings.miIris.fillAlpha;
            flareComponents.miIris.options.fringeAlpha = flareSettings.miIris.fringeAlpha;
            flareComponents.miIris.options.fringeSize = flareSettings.miIris.fringeSize / flareSettings.downscaling;
            flareComponents.miIris.options.blur = flareSettings.miIris.blur / flareSettings.downscaling;
            flareComponents.miIris.options.angle = flareSettings.miIris.angle;
            flareComponents.miIris.options.hue = flareSettings.miIris.hue;
            flareComponents.miIris.options.saturation = flareSettings.miIris.saturation;
            flareComponents.miIris.render();
        }
        if (renderGlow) {
            flareComponents.glow.radius = Math.floor(flareSettings.glow.radius / flareSettings.downscaling);
            flareComponents.glow.options.intensity = -flareSettings.glow.softening;
            flareComponents.glow.options.hue = flareSettings.glow.hue;
            flareComponents.glow.options.saturation = flareSettings.glow.saturation;
            flareComponents.glow.render();
        }
        if (renderLensOrbs) {
            flareComponents.lensOrbs.radius = Math.floor(flareSettings.lensOrbs.radius / flareSettings.downscaling);
            flareComponents.lensOrbs.options.sides = flareSettings.lensOrbs.sides;
            flareComponents.lensOrbs.options.roundness = flareSettings.lensOrbs.roundness;
            flareComponents.lensOrbs.options.fillAlpha = flareSettings.lensOrbs.fillAlpha;
            flareComponents.lensOrbs.options.fringeAlpha = flareSettings.lensOrbs.fringeAlpha;
            flareComponents.lensOrbs.options.fringeSize = flareSettings.lensOrbs.fringeSize / flareSettings.downscaling;
            flareComponents.lensOrbs.options.blur = flareSettings.lensOrbs.blur / flareSettings.downscaling;
            flareComponents.lensOrbs.options.angle = flareSettings.lensOrbs.angle;
            flareComponents.lensOrbs.options.hue = flareSettings.lensOrbs.hue;
            flareComponents.lensOrbs.options.saturation = flareSettings.lensOrbs.saturation;
            flareComponents.lensOrbs.render();
        }

        var ctx = baseCanvas.getContext("2d");
        ctx.restore();
        ctx.save();
        ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

        if (flareSettings.hotspot.visible) {
            drawComponent(ctx, flareComponents.hotspot, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.hotspot.radius * 2, flareSettings.hotspot.radius * 2 * (1 - flareSettings.hotspot.anamorph / 100), 0, flareSettings.hotspot.alpha, 0, flareSettings.sizeMultiplier);
        }
        if (flareSettings.streak.visible) {
            var streakAngle = flareSettings.streak.angle;
            for (var i = 0; i < flareSettings.streak.count; i++) {
                var streakOffset = (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.streak.shift / 100;
                if (flareSettings.streak.count > 1) streakOffset = flareSettings.streak.shift * ((i % 2 == 0)?-1:1) / 100 * flareSettings.streak.width;
                drawComponent(ctx, flareComponents.streakRightHalf, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width + streakOffset, flareSettings.streak.thickness, streakAngle, flareSettings.streak.alpha, 0, flareSettings.sizeMultiplier);
                drawComponent(ctx, flareComponents.streakLeftHalf, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width - streakOffset, flareSettings.streak.thickness, streakAngle, flareSettings.streak.alpha, 0, flareSettings.sizeMultiplier);
                streakAngle += 180 / flareSettings.streak.count;
            }
        }
        if (flareSettings.ring.visible) {
            drawComponent(ctx, flareComponents.ring, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.ring.radius * 2, flareSettings.ring.radius * 2 * (1 - flareSettings.ring.anamorph / 100), 0, flareSettings.ring.alpha, 0, flareSettings.sizeMultiplier);
        }
        if (flareSettings.miIris.visible) {
            var miRng = seedrandom(flareSettings.miIris.seed);
            for (var i = 1; i < flareSettings.miIris.countTowards; i++) {
                var irisPosition = {
                    x: flareSettings.positioning.x + i * (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.miIris.spread / 100,
                    y: flareSettings.positioning.y + i * (flareSettings.positioning.pivotY - flareSettings.positioning.y) * flareSettings.miIris.spread / 100,
                };
                var irisScale = 1 + (miRng() - 0.5) * 2 * flareSettings.miIris.sizeVariance / 100;
                irisScale -= (1 - i / flareSettings.miIris.countTowards) * flareSettings.miIris.perspective / 100;
                drawComponent(ctx, flareComponents.miIris, irisPosition.x, irisPosition.y, flareSettings.miIris.radius * 2 * irisScale, flareSettings.miIris.radius * 2 * irisScale * (1 - flareSettings.miIris.anamorph / 100), 0, 100 - flareSettings.miIris.alphaVariance * miRng(), flareSettings.miIris.hueVariance * (miRng() * 2 - 1), flareSettings.sizeMultiplier);
            }
            for (var i = 1; i < flareSettings.miIris.countAway; i++) {
                var irisPosition = {
                    x: flareSettings.positioning.x - i * (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.miIris.spread / 100,
                    y: flareSettings.positioning.y - i * (flareSettings.positioning.pivotY - flareSettings.positioning.y) * flareSettings.miIris.spread / 100,
                };
                var irisScale = 1 + (miRng() - 0.5) * 2 * flareSettings.miIris.sizeVariance / 100;
                irisScale -= (1 - i / flareSettings.miIris.countTowards) * flareSettings.miIris.perspective / 100;
                drawComponent(ctx, flareComponents.miIris, irisPosition.x, irisPosition.y, flareSettings.miIris.radius * 2 * irisScale, flareSettings.miIris.radius * 2 * irisScale * (1 - flareSettings.miIris.anamorph / 100), 0, 100 - flareSettings.miIris.alphaVariance * miRng(), flareSettings.miIris.hueVariance * (miRng() * 2 - 1), flareSettings.sizeMultiplier);
            }
        }
        if (flareSettings.glow.visible) {
            drawComponent(ctx, flareComponents.glow, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.glow.radius * 2, flareSettings.glow.radius * 2 * (1 - flareSettings.glow.anamorph / 100), 0, flareSettings.glow.alpha, 0, flareSettings.sizeMultiplier);
        }
        if (flareSettings.lensOrbs.visible) {
            var lensOrbsRng = seedrandom(flareSettings.lensOrbs.seed);
            for (var i = 1; i < flareSettings.lensOrbs.count; i++) {
                var orbPosition = {
                    x: lensOrbsRng() * flareSettings.dimensions.width,
                    y: lensOrbsRng() * flareSettings.dimensions.height,
                };
                var distanceFromLight = Math.sqrt(Math.pow(flareSettings.positioning.x - orbPosition.x, 2) + Math.pow(flareSettings.positioning.y - orbPosition.y, 2));
                var orbAlpha = Math.max(0, (1 - distanceFromLight / flareSettings.lensOrbs.threshold) * 100);
                orbAlpha = Math.max(0, orbAlpha - flareSettings.lensOrbs.alphaVariance * lensOrbsRng());
                var orbScale = 1 + (lensOrbsRng() - 0.5) * 2 * flareSettings.lensOrbs.sizeVariance / 100;
                drawComponent(ctx, flareComponents.lensOrbs, orbPosition.x, orbPosition.y, flareSettings.lensOrbs.radius * 2 * orbScale, flareSettings.lensOrbs.radius * 2 * orbScale * (1 - flareSettings.lensOrbs.anamorph / 100), 0, orbAlpha, flareSettings.lensOrbs.hueVariance * (lensOrbsRng() * 2 - 1), flareSettings.sizeMultiplier);
            }
        }
    }

    function handleClickDrag(e) {
        //console.log(e.detail);
        flareSettings.positioning.x = e.detail.x;
        flareSettings.positioning.y = e.detail.y;
        renderFlare();
    }

    function createDownloadLink() {
        var initialDownscaling = flareSettings.downscaling;
        flareSettings.downscaling = 1;
        renderFlare(true, true, true, true, true);
        var a = document.createElement("a");
        a.href = baseCanvas.toDataURL("image/" + flareSettings.exportType);
        a.download = "ProgenFlares2-flare." + flareSettings.exportType;
        flareSettings.downscaling = initialDownscaling;
        renderFlare(true, true, true, true, true);
        return a;
    }

    function createPresetSaveLink() {
        var fileContents = JSON.stringify({
            hotspot: flareSettings.hotspot,
            streak: flareSettings.streak,
            ring: flareSettings.ring,
            miIris: flareSettings.miIris,
            glow: flareSettings.glow,
            lensOrbs: flareSettings.lensOrbs,
        });
        var textFile = new Blob([fileContents], { "type": "application/pgf2" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(textFile);
        a.download = "ProgenFlares2-preset.pgf2";
        return a;
    }

    function setPreset(presetData) {
        for (var keyi in presetData) {
            if (!flareSettings[keyi]) flareSettings[keyi] = {};
            for (var keyj in presetData[keyi]) {
                flareSettings[keyi][keyj] = presetData[keyi][keyj];
            }
        }
        if (!presetData["lensOrbs"]) flareSettings["lensOrbs"]["visible"] = false;
        if (!presetData["hotspot"]["deformationOctaves"]) flareSettings["hotspot"]["deformationOctaves"] = 10;
        renderFlare(true, true, true, true, true, true);
    }

    var startScreenVisible = true;
    let myPresetPicker;
    function onStart() {
        setPreset(myPresetPicker.defaultPreset);
        flareSettings.positioning.pivotX = flareSettings.dimensions.width / 2;
        flareSettings.positioning.pivotY = flareSettings.dimensions.height / 2;
        flareSettings.positioning.x = flareSettings.dimensions.width * 2 / 5;
        flareSettings.positioning.y = flareSettings.dimensions.height * 2 / 5;
        renderFlare(true, true, true, true, true, true);
        startScreenVisible = false;
    }

    var rIcheckbox;
    function handleRIbutton() {
            var fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/png, image/jpeg";
            fileInput.addEventListener("change", () => {
                var file = fileInput.files[0];
                var fR = new FileReader();
                fR.addEventListener("loadend", (e) => {
                    referenceImage.style.backgroundImage = `url("${e.target.result}")`;
                    this.value = "Custom";
                    rIcheckbox.checked = true;
                    (handleRIcheckbox.bind(rIcheckbox))();
                });
                fR.readAsDataURL(file);
            });
            fileInput.click();
    }
    function handleRIcheckbox() {
        if (this.checked) referenceImage.style.backgroundSize = "100% 100%";
        else referenceImage.style.backgroundSize = "0 0";
    }

    function handleScaleMultiplier() {
        flareSettings.hotspot.radius *= flareSettings.sizeMultiplier;
        flareSettings.streak.thickness *= flareSettings.sizeMultiplier;
        flareSettings.streak.width *= flareSettings.sizeMultiplier;
        flareSettings.ring.radius *= flareSettings.sizeMultiplier;
        flareSettings.ring.thickness *= flareSettings.sizeMultiplier;
        flareSettings.ring.blur *= flareSettings.sizeMultiplier;
        flareSettings.ring.cropSize *= flareSettings.sizeMultiplier;
        flareSettings.miIris.radius *= flareSettings.sizeMultiplier;
        flareSettings.miIris.fringeSize *= flareSettings.sizeMultiplier;
        flareSettings.miIris.blur *= flareSettings.sizeMultiplier;
        flareSettings.glow.radius *= flareSettings.sizeMultiplier;
        flareSettings.lensOrbs.radius *= flareSettings.sizeMultiplier;
        flareSettings.lensOrbs.fringeSize *= flareSettings.sizeMultiplier;
        flareSettings.lensOrbs.blur *= flareSettings.sizeMultiplier;
        flareSettings.sizeMultiplier = 1;
        renderFlare(true, true, true, true, true, true);
    }

    let isPopupPlugin = false;
    onMount(function() {
        renderFlare(true, true, true, true, true, true);

        let locSearch = new URLSearchParams(location.search);
        if (locSearch.get("popupPlugin") == "yeah") {
            isPopupPlugin = true;
            flareSettings.dimensions.width = parseInt(locSearch.get("docWidth"));
            flareSettings.dimensions.height = parseInt(locSearch.get("docHeight"));
            setTimeout(onStart, 1);
            window.addEventListener("message", function(e) {
                console.log(e.data);
                if (e.data[0] == "refImage") {
                    referenceImage.style.backgroundImage = `url("${e.data[1]}")`;
                    rIcheckbox.checked = true;
                    (handleRIcheckbox.bind(rIcheckbox))();
                }
            });
            window.opener.postMessage(["pluginStatus", "ready"]);
        }
    });
</script>

<div id={"exportPanel"}>
{#if (!isPopupPlugin)}
    <button on:click={function() { createDownloadLink().click(); }}>Export</button>
    <span style={"display: inline-block; margin-left: 5px; margin-right: 5px;"}>as</span>
    <select bind:value={flareSettings.exportType}>
        <option value={"png"}>PNG</option>
        <option value={"jpeg"}>JPG</option>
        <option value={"webp"}>WebP</option>
    </select>
{/if}
{#if (isPopupPlugin)}
    <button on:click={function() { window.opener.postMessage(["finalImage", createDownloadLink().href]); }}>Finish</button>
    <span style="white-space: pre;">{"  "}</span>
    <button on:click={function() { window.close(); }}>Close</button>
{/if}
</div>

<div id={"previewSection"}>   
    <canvas bind:this={referenceImage} id={"referenceImage"} width={flareSettings.dimensions.width} height={flareSettings.dimensions.height} class={"centered"}></canvas>
    <canvas bind:this={baseCanvas} id={"baseCanvas"} use:canvasClickDrag on:clickDrag={handleClickDrag} width={flareSettings.dimensions.width} height={flareSettings.dimensions.height} class={"centered"}></canvas>
</div>

<div id={"sectionAbovePreview"}>
Preview quality
<select bind:value={flareSettings.downscaling} on:change={function() { renderFlare(true, true, true, true, true); }}>
    <option value={1}>100%</option>
    <option value={5/4}>80%</option>
    <option value={5/3}>60%</option>
    <option value={5/2}>40%</option>
    <option value={5}>20%</option>
</select>
<span style={"white-space: pre; color: grey;"}>{"    |    "}</span>
<input type="checkbox" bind:this={rIcheckbox} on:change={handleRIcheckbox} checked={true} style={"margin-bottom: 0;"} />
Reference Image
<button on:click={handleRIbutton}>Import</button>
</div>

<div id={"controlPanel"}>

<div style={`
    position: sticky;
    top: 0;
    width: 100%;
    background-color: var(--color-scheme-6);
    padding: 5px;
    box-sizing: border-box;
        border-bottom: 1px solid #353535;
`}>
    <PresetPicker on:choose={ function(e) { setPreset(e.detail); } } bind:this={myPresetPicker} />
    <button on:click={function() { createPresetSaveLink().click(); }} style="float: right; width: 49%;">Create Preset</button>
</div>

<Collapsible title={"Global"} collapsed={false}>
    Light X: <Slider min={0} max={flareSettings.dimensions.width} bind:value={flareSettings.positioning.x} on:input={function() { renderFlare(); }} /> <br />
    Light Y: <Slider min={0} max={flareSettings.dimensions.height} bind:value={flareSettings.positioning.y} on:input={function() { renderFlare(); }} /> <br />
    Focus X: <Slider min={0} max={flareSettings.dimensions.width} bind:value={flareSettings.positioning.pivotX} on:input={function() { renderFlare(); }} /> <br />
    Focus Y: <Slider min={0} max={flareSettings.dimensions.height} bind:value={flareSettings.positioning.pivotY} on:input={function() { renderFlare(); }} /> <br />
    Scale Multiplier: <Slider min={0.01} max={2} step={0.01} bind:value={flareSettings.sizeMultiplier} on:input={function() { renderFlare(); }} on:change={handleScaleMultiplier} /> <br />
</Collapsible>
<Collapsible title={"Hotspot"}>
    <label style="text-align: center;">
        <input type="checkbox" bind:checked={flareSettings.hotspot.visible} on:change={function() { renderFlare(true); }} />
        Visible
    </label>
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.hotspot.alpha} on:input={function() { renderFlare(true); }} /> <br />
    Angle: <Slider min={0} max={360} bind:value={flareSettings.hotspot.angle} on:input={function() { renderFlare(true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.hotspot.hue} on:input={function() { renderFlare(true); }} className="hueSlider" /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.hotspot.saturation} on:input={function() { renderFlare(true); }} /> <br />
    Size: <Slider min={0} max={1000} bind:value={flareSettings.hotspot.radius} on:input={function() { renderFlare(true); }} /> <br />
    Intensity: <Slider min={0} max={50} bind:value={flareSettings.hotspot.intensity} on:input={function() { renderFlare(true); }} /> <br />
    Rays Frequency: <Slider min={0} max={0.05} step={0.001} bind:value={flareSettings.hotspot.deformationFrequency} on:input={function() { renderFlare(true); }} /> <br />
    Rays Definition: <Slider min={0} max={2.1} step={0.01} bind:value={flareSettings.hotspot.deformationAmount} on:input={function() { renderFlare(true); }} /> <br />
    Rays Detail: <Slider min={1} max={10} step={1} bind:value={flareSettings.hotspot.deformationOctaves} on:input={function() { renderFlare(true); }} /> <br />
    Random Seed: <Slider min={1} max={999} bind:value={flareSettings.hotspot.deformationSeed} on:input={function() { renderFlare(true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.hotspot.anamorph} on:input={function() { renderFlare(true); }} /> <br />
</Collapsible>
<Collapsible title={"Streak"}>
    <label style="text-align: center;">
        <input type="checkbox" bind:checked={flareSettings.streak.visible} on:change={function() { renderFlare(false, true); }} />
        Visible
    </label>
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.streak.alpha} on:input={function() { renderFlare(false, true); }} /> <br />
    Angle: <Slider min={0} max={360} bind:value={flareSettings.streak.angle} on:input={function() { renderFlare(false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.streak.hue} on:input={function() { renderFlare(false, true); }} className="hueSlider" /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.streak.saturation} on:input={function() { renderFlare(false, true); }} /> <br />
    Thickness: <Slider min={0} max={200} bind:value={flareSettings.streak.thickness} on:input={function() { renderFlare(false, true); }} /> <br />
    Length: <Slider min={0} max={5000} bind:value={flareSettings.streak.width} on:input={function() { renderFlare(false, true); }} /> <br />
    Intensity: <Slider min={-30} max={50} bind:value={flareSettings.streak.intensity} on:input={function() { renderFlare(false, true); }} /> <br />
    Starring: <Slider min={1} max={8} bind:value={flareSettings.streak.count} on:input={function() { renderFlare(false, true); }} /> <br />
    Shift: <Slider min={0} max={100} bind:value={flareSettings.streak.shift} on:input={function() { renderFlare(false, true); }} /> <br />
</Collapsible>
<Collapsible title={"Ring"}>
    <label style="text-align: center;">
        <input type="checkbox" bind:checked={flareSettings.ring.visible} on:change={function() { renderFlare(false, false, true); }} />
        Visible
    </label>
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.ring.alpha} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.ring.hue} on:input={function() { renderFlare(false, false, true); }} className="hueSlider" /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.ring.saturation} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Size: <Slider min={0} max={810} bind:value={flareSettings.ring.radius} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Thickness: <Slider min={0} max={500} bind:value={flareSettings.ring.thickness} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Softness: <Slider min={0} max={50} bind:value={flareSettings.ring.blur} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Crop Size: <Slider min={0} max={810} bind:value={flareSettings.ring.cropSize} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Crop Hardness: <Slider min={0} max={100} bind:value={flareSettings.ring.cropHardness} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.ring.anamorph} on:input={function() { renderFlare(false, false, true); }} /> <br />
</Collapsible>
<Collapsible title={"Multi-Iris"}>
    <label style="text-align: center;">
        <input type="checkbox" bind:checked={flareSettings.miIris.visible} on:change={function() { renderFlare(false, false, false, true); }} />
        Visible
    </label>
    Fill Alpha: <Slider min={0} max={100} bind:value={flareSettings.miIris.fillAlpha} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Fringe Alpha: <Slider min={0} max={100} bind:value={flareSettings.miIris.fringeAlpha} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Angle: <Slider min={0} max={360} bind:value={flareSettings.miIris.angle} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.miIris.hue} on:input={function() { renderFlare(false, false, false, true); }} className="hueSlider" /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.miIris.saturation} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Size: <Slider min={0} max={810} bind:value={flareSettings.miIris.radius} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Edges: <Slider min={3} max={12} bind:value={flareSettings.miIris.sides} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Roundness: <Slider min={0} max={100} bind:value={flareSettings.miIris.roundness} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Fringe Size: <Slider min={0} max={100} bind:value={flareSettings.miIris.fringeSize} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Softness: <Slider min={0} max={30} bind:value={flareSettings.miIris.blur} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Count Towards: <Slider min={0} max={50} bind:value={flareSettings.miIris.countTowards} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Count Away: <Slider min={0} max={50} bind:value={flareSettings.miIris.countAway} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Spread: <Slider min={0} max={100} bind:value={flareSettings.miIris.spread} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Size Variance: <Slider min={0} max={100} bind:value={flareSettings.miIris.sizeVariance} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Perspective: <Slider min={0} max={100} bind:value={flareSettings.miIris.perspective} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Alpha Variance: <Slider min={0} max={100} bind:value={flareSettings.miIris.alphaVariance} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Hue Variance: <Slider min={0} max={180} bind:value={flareSettings.miIris.hueVariance} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Random Seed: <Slider min={0} max={999} bind:value={flareSettings.miIris.seed} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.miIris.anamorph} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
</Collapsible>
<Collapsible title={"Glow"}>
    <label style="text-align: center;">
        <input type="checkbox" bind:checked={flareSettings.glow.visible} on:change={function() { renderFlare(false, false, false, false, true); }} />
        Visible
    </label>
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.glow.alpha} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.glow.hue} on:input={function() { renderFlare(false, false, false, false, true); }} className="hueSlider" /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.glow.saturation} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Size: <Slider min={0} max={1500} bind:value={flareSettings.glow.radius} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Softness: <Slider min={0} max={200} bind:value={flareSettings.glow.softening} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.glow.anamorph} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
</Collapsible>
<Collapsible title={"Lens Orbs"}>
    <label style="text-align: center;">
        <input type="checkbox" bind:checked={flareSettings.lensOrbs.visible} on:change={function() { renderFlare(false, false, false, false, false, true); }} />
        Visible
    </label>
    Count: <Slider min={0} max={200} bind:value={flareSettings.lensOrbs.count} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Threshold: <Slider min={0} max={1500} bind:value={flareSettings.lensOrbs.threshold} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Fill Alpha: <Slider min={0} max={100} bind:value={flareSettings.lensOrbs.fillAlpha} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Fringe Alpha: <Slider min={0} max={100} bind:value={flareSettings.lensOrbs.fringeAlpha} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Angle: <Slider min={0} max={360} bind:value={flareSettings.lensOrbs.angle} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.lensOrbs.hue} on:input={function() { renderFlare(false, false, false, false, false, true); }} className="hueSlider" /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.lensOrbs.saturation} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Size: <Slider min={0} max={810} bind:value={flareSettings.lensOrbs.radius} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Edges: <Slider min={3} max={12} bind:value={flareSettings.lensOrbs.sides} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Roundness: <Slider min={0} max={100} bind:value={flareSettings.lensOrbs.roundness} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Fringe Size: <Slider min={0} max={100} bind:value={flareSettings.lensOrbs.fringeSize} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Softness: <Slider min={0} max={30} bind:value={flareSettings.lensOrbs.blur} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Size Variance: <Slider min={0} max={100} bind:value={flareSettings.lensOrbs.sizeVariance} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Alpha Variance: <Slider min={0} max={100} bind:value={flareSettings.lensOrbs.alphaVariance} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Hue Variance: <Slider min={0} max={180} bind:value={flareSettings.lensOrbs.hueVariance} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Random Seed: <Slider min={0} max={999} bind:value={flareSettings.lensOrbs.seed} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.lensOrbs.anamorph} on:input={function() { renderFlare(false, false, false, false, false, true); }} /> <br />
</Collapsible>
</div>

{#if startScreenVisible}
    <div id={"startScreen"} style="background-image: url({coverImage});" out:fade>
        <div class={"centered"} style={"width: calc(min(500px, 100vw)); height: calc(min(500px, 100vh)); backdrop-filter: blur(5px) brightness(0.625); border-radius: 7.5px;"}></div>
        <div class={"centered"} style={"text-align: center;"}>
            <img alt="PROGEN FLARES 2" src={textLogo} width="321" draggable={false} />
            <br /> <br />
            <span style={"width: 145px; text-align: left; display: inline-block;"}>Image Width</span> <input type="number" bind:value={flareSettings.dimensions.width} style={"width: 80px;"} />
            <br />
            <span style={"width: 145px; text-align: left; display: inline-block;"}>Image Height</span> <input type="number" bind:value={flareSettings.dimensions.height} style={"width: 80px;"} />
            <br /> <br />
            <button on:click={onStart}>Create</button>
            <br /> <br />
            <span style={"font-size: 10px;"}>&copy; 2023 Lunal Graphics<br />Developed by Yikuan Sun</span>
        </div>
    </div>
{/if}

<style>
    :root {
        --color-scheme-1: #f27700;
        --color-scheme-2: #d06100;
        --color-scheme-3: #a24200;
        --color-scheme-4: #712200;
        --color-scheme-5: #430300;
        /*--color-scheme-6: #181d29;*/
        --color-scheme-6: #242424;
    }
    :global(body) {
        background-color: var(--color-scheme-6);
        color: whitesmoke;
        user-select: none;
    }
    #baseCanvas, #referenceImage {
        max-width: calc(100% - 50px);
        max-height: calc(100% - 50px);
    }
    #referenceImage {
        background-color: black;
        background-size: 100% 100%;
    }
    #baseCanvas {
        mix-blend-mode: screen;
    }
    :global(slider) {
        float: right;
        accent-color: var(--color-scheme-1);
    }
    :global(input[type=number]) {
        color: var(--color-scheme-1);
        background-color: #181818;
        border: 1px solid #181818;
        transition: border 0.2s, box-shadow 0.2s;
        -moz-appearance: textfield;
    }
    :global(input[type=number]):focus {
        border: 1px solid var(--color-scheme-1);
        box-shadow: inset 0 0 4px var(--color-scheme-2);
        outline: none!important;
        -moz-appearance: revert!important;
    }
    :global(input[type=number]):hover {
        border: 1px solid var(--color-scheme-1);
        -moz-appearance: revert!important;
    }
    #controlPanel {
        width: 360px;
        height: 100vh;
        position: fixed;
        right: 0;
        top: 0;
        overflow-y: scroll;
        border-left: 1px solid #353535;
    }
    #previewSection {
        width: calc(100vw - 360px);
        height: calc(100vh - 2 * 84px);
        box-sizing: border-box;
        padding: 25px;
        position: fixed;
        top: 84px;
        left: 0;
    }
    .centered {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    #sectionAbovePreview {
        width: calc(100vw - 360px);
        height: 84px;
        box-sizing: border-box;
        text-align: center;
        padding: 20px;
        position: fixed;
        top: 0;
        left: 0;
    }
    #exportPanel {
        width: calc(100vw - 360px);
        height: 84px;
        box-sizing: border-box;
        text-align: center;
        padding: 20px;
        position: fixed;
        bottom: 0;
        left: 0;
    }
    #startScreen {
        width: 100vw;
        height: 100vh;
        background-color: var(--color-scheme-6);
        position: fixed;
        top: 0;
        left: 0;
        background-size: cover;
        background-position: center;
    }
    :global(button) {
        padding: 4px 12px;
        background-color: #333333;
        border: 1px solid #555555;
        color: var(--color-scheme-1);
        transition: border 0.2s, box-shadow 0.2s, background-color 0.2s;
    }
    :global(button):focus, :global(select):focus {
        border: 1px solid var(--color-scheme-1);
        box-shadow: inset 0 0 4px var(--color-scheme-2);
        outline: none!important;
    }
    :global(button):hover, :global(select):hover {
        border: 1px solid var(--color-scheme-1);
    }
    :global(select) {
        padding: 4px;
        background-color: #333333;
        border: 1px solid #555555;
        color: var(--color-scheme-1);
        transition: border 0.2s, box-shadow 0.2s;
    }
    :global(select), :global(button) {
        margin-bottom: 0;
    }
    :global(::-webkit-scrollbar) {
        width: 10px;
        height: 10px;
    }
    :global(::-webkit-scrollbar-track) {
        opacity: 0;
    }
    :global(::-webkit-scrollbar-thumb) {
        background: #333333;
    }
    :global(::-webkit-scrollbar-thumb:hover) {
        background: var(--color-scheme-3);
    }
    :global(::selection) {
        background-color: var(--color-scheme-4);
    }
    :global(input[type=checkbox]) {
        accent-color: var(--color-scheme-2);
    }
    :global(input[type=range]) {
        -webkit-appearance: none;
        appearance: none;
        outline: none!important;
        background-color: #353535!important;
        height: 5px!important;
        border: 0!important;
    }
    :global(input[type="range"]::-webkit-slider-thumb) {
        -webkit-appearance: none;
        appearance: none;
        height: 10px!important;
        width: 10px!important;
        background-color: var(--color-scheme-1)!important;
        border-radius: 50%;
        border: 0!important;
    }
    :global(input[type="range"]::-webkit-slider-thumb:hover) {
        background-color: var(--color-scheme-3)!important;
    }
    :global( input[type="range"]::-moz-range-thumb) {
        height: 10px!important;
        width: 10px!important;
        background-color: var(--color-scheme-1)!important;
        border-radius: 50%;
        border: 0!important;
    }
    :global( input[type="range"]::-moz-range-thumb:hover) {
        background-color: var(--color-scheme-3)!important;
    }
    :global(.hueSlider input[type="range"]) {
        background: linear-gradient(to right, hsl(0, 100%, 25%), hsl(30deg, 100%, 25%), hsl(60deg, 100%, 25%), hsl(90deg, 100%, 25%), hsl(120deg, 100%, 25%), hsl(150deg, 100%, 25%), hsl(180deg, 100%, 25%), hsl(210deg, 100%, 25%), hsl(240deg, 100%, 25%), hsl(270deg, 100%, 25%), hsl(300deg, 100%, 25%), hsl(330deg, 100%, 25%), hsl(360deg, 100%, 25%));
    }
</style>

<svelte:head>
    <title>Progen Flares 2</title>
</svelte:head>