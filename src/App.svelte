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
    };

    var flareSettings = {
        downscaling: 2,
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
            radius: 500,
            intensity: 5,
            deformationAmount: 1.6,
            deformationFrequency: 0.006,
            deformationSeed: 1,
            alpha: 100,
            angle: 0,
            hue: 200,
            saturation: 100,
            anamorph: 0,
        },
        streak: {
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
            anamorph: 0,
        },
        glow: {
            radius: 960,
            alpha: 80,
            softening: 70,
            hue: 200,
            saturation: 100,
            anamorph: 0,
        },
    };

    var baseCanvas;
    
    function renderFlare(renderHotspot=false, renderStreak=false, renderRing=false, renderMI=false, renderGlow=false) {
        if (renderHotspot) {
            flareComponents.hotspot.radius = Math.floor(flareSettings.hotspot.radius / flareSettings.downscaling);
            flareComponents.hotspot.options.intensity = flareSettings.hotspot.intensity / flareSettings.downscaling;
            flareComponents.hotspot.options.deformationAmount = flareSettings.hotspot.deformationAmount;
            flareComponents.hotspot.options.deformationFrequency = flareSettings.hotspot.deformationFrequency;
            flareComponents.hotspot.options.deformationSeed = flareSettings.hotspot.deformationSeed;
            flareComponents.hotspot.options.hue = flareSettings.hotspot.hue;
            flareComponents.hotspot.options.saturation = flareSettings.hotspot.saturation;
            flareComponents.hotspot.render();
        }
        if (renderStreak) {
            flareComponents.streak.radius = Math.floor(flareSettings.streak.thickness * 2 / flareSettings.downscaling);
            flareComponents.streak.options.intensity = flareSettings.streak.intensity / flareSettings.downscaling;
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
            flareComponents.miIris.options.fringeSize = Math.floor(flareSettings.miIris.fringeSize / flareSettings.downscaling);
            flareComponents.miIris.options.blur = Math.floor(flareSettings.miIris.blur / flareSettings.downscaling);
            flareComponents.miIris.options.angle = flareSettings.miIris.angle;
            flareComponents.miIris.options.hue = flareSettings.miIris.hue;
            flareComponents.miIris.options.saturation = flareSettings.miIris.saturation;
            flareComponents.miIris.render();
        }
        if (renderGlow) {
            flareComponents.glow.radius = Math.floor(flareSettings.glow.radius / flareSettings.downscaling);
            flareComponents.glow.options.intensity = Math.floor(-flareSettings.glow.softening / flareSettings.downscaling);
            flareComponents.glow.options.hue = flareSettings.glow.hue;
            flareComponents.glow.options.saturation = flareSettings.glow.saturation;
            flareComponents.glow.render();
        }

        var ctx = baseCanvas.getContext("2d");
        ctx.restore();
        ctx.save();
        ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
        drawComponent(ctx, flareComponents.hotspot, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.hotspot.radius * 2, flareSettings.hotspot.radius * 2 * (1 - flareSettings.hotspot.anamorph / 100), flareSettings.hotspot.angle, flareSettings.hotspot.alpha);
        var streakAngle = flareSettings.streak.angle;
        for (var i = 0; i < flareSettings.streak.count; i++) {
            var streakOffset = (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.streak.shift / 100;
            if (flareSettings.streak.count > 1) streakOffset = flareSettings.streak.shift * ((i % 2 == 0)?-1:1) / 100 * flareSettings.streak.width;
            drawComponent(ctx, flareComponents.streakRightHalf, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width + streakOffset, flareSettings.streak.thickness, streakAngle, flareSettings.streak.alpha);
            drawComponent(ctx, flareComponents.streakLeftHalf, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width - streakOffset, flareSettings.streak.thickness, streakAngle, flareSettings.streak.alpha);
            streakAngle += 180 / flareSettings.streak.count;
        }
        drawComponent(ctx, flareComponents.ring, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.ring.radius * 2, flareSettings.ring.radius * 2 * (1 - flareSettings.ring.anamorph / 100), 0, flareSettings.ring.alpha);

        var miRng = seedrandom(flareSettings.miIris.seed);
        for (var i = 1; i < flareSettings.miIris.countTowards; i++) {
            var irisPosition = {
                x: flareSettings.positioning.x + i * (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.miIris.spread / 100,
                y: flareSettings.positioning.y + i * (flareSettings.positioning.pivotY - flareSettings.positioning.y) * flareSettings.miIris.spread / 100,
            };
            var irisScale = 1 + (miRng() - 0.5) * 2 * flareSettings.miIris.sizeVariance / 100;
            irisScale -= (1 - i / flareSettings.miIris.countTowards) * flareSettings.miIris.perspective / 100;
            drawComponent(ctx, flareComponents.miIris, irisPosition.x, irisPosition.y, flareSettings.miIris.radius * 2 * irisScale, flareSettings.miIris.radius * 2 * irisScale * (1 - flareSettings.miIris.anamorph / 100), 0, 100 - flareSettings.miIris.alphaVariance * miRng());
        }
        for (var i = 1; i < flareSettings.miIris.countAway; i++) {
            var irisPosition = {
                x: flareSettings.positioning.x - i * (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.miIris.spread / 100,
                y: flareSettings.positioning.y - i * (flareSettings.positioning.pivotY - flareSettings.positioning.y) * flareSettings.miIris.spread / 100,
            };
            var irisScale = 1 + (miRng() - 0.5) * 2 * flareSettings.miIris.sizeVariance / 100;
            irisScale -= (1 - i / flareSettings.miIris.countTowards) * flareSettings.miIris.perspective / 100;
            drawComponent(ctx, flareComponents.miIris, irisPosition.x, irisPosition.y, flareSettings.miIris.radius * 2 * irisScale, flareSettings.miIris.radius * 2 * irisScale * (1 - flareSettings.miIris.anamorph / 100), 0, 100 - flareSettings.miIris.alphaVariance * miRng());
        }

        drawComponent(ctx, flareComponents.glow, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.glow.radius * 2, flareSettings.glow.radius * 2 * (1 - flareSettings.glow.anamorph / 100), 0, flareSettings.glow.alpha);
    }

    window.onload = function() { renderFlare(true, true, true, true, true); };

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
        a.href = baseCanvas.toDataURL();
        a.download = "ProgenFlares2-flare.png";
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
        });
        var textFile = new Blob([fileContents], { "type": "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(textFile);
        a.download = "ProgenFlares2-preset.pgf2";
        return a;
    }

    function setPreset(presetData) {
        for (var key in presetData) {
            flareSettings[key] = presetData[key];
        }
        renderFlare(true, true, true, true, true);
    }
</script>

<button on:click={function() { createDownloadLink().click(); }}>Export</button> <br />
<button on:click={function() { createPresetSaveLink().click(); }}>Save Preset</button> <br />

<canvas bind:this={baseCanvas} use:canvasClickDrag on:clickDrag={handleClickDrag} width={flareSettings.dimensions.width} height={flareSettings.dimensions.height}></canvas>

<br uh />

Preview quality
<select bind:value={flareSettings.downscaling} on:change={function() { renderFlare(true, true, true); }}>
    <option value={1}>100%</option>
    <option value={2}>50%</option>
    <option value={4}>25%</option>
</select>
<br uh />

<div style={`
width: 360px;
`}>
<PresetPicker on:choose={ function(e) { setPreset(e.detail); } } />
<Collapsible title={"positioning"} collapsed={false}>
    X: <Slider min={0} max={flareSettings.dimensions.width} bind:value={flareSettings.positioning.x} on:input={function() { renderFlare(); }} /> <br />
    Y: <Slider min={0} max={flareSettings.dimensions.height} bind:value={flareSettings.positioning.y} on:input={function() { renderFlare(); }} /> <br />
    Pivot X: <Slider min={0} max={flareSettings.dimensions.width} bind:value={flareSettings.positioning.pivotX} on:input={function() { renderFlare(); }} /> <br />
    Pivot Y: <Slider min={0} max={flareSettings.dimensions.height} bind:value={flareSettings.positioning.pivotY} on:input={function() { renderFlare(); }} /> <br />
</Collapsible>
<Collapsible title={"hi"}>
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.hotspot.alpha} on:input={function() { renderFlare(true); }} /> <br />
    Angle: <Slider min={0} max={360} bind:value={flareSettings.hotspot.angle} on:input={function() { renderFlare(true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.hotspot.hue} on:input={function() { renderFlare(true); }} /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.hotspot.saturation} on:input={function() { renderFlare(true); }} /> <br />
    Size: <Slider min={0} max={900} bind:value={flareSettings.hotspot.radius} on:input={function() { renderFlare(true); }} /> <br />
    Intensity: <Slider min={0} max={50} bind:value={flareSettings.hotspot.intensity} on:input={function() { renderFlare(true); }} /> <br />
    Rays Frequency: <Slider min={0} max={0.05} step={0.001} bind:value={flareSettings.hotspot.deformationFrequency} on:input={function() { renderFlare(true); }} /> <br />
    Rays Definition: <Slider min={0} max={2.1} step={0.01} bind:value={flareSettings.hotspot.deformationAmount} on:input={function() { renderFlare(true); }} /> <br />
    Seed: <Slider min={1} max={999} bind:value={flareSettings.hotspot.deformationSeed} on:input={function() { renderFlare(true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.hotspot.anamorph} on:input={function() { renderFlare(true); }} /> <br />
</Collapsible>
<Collapsible title={"anamorphic streak"}>
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.streak.alpha} on:input={function() { renderFlare(false, true); }} /> <br />
    Angle: <Slider min={0} max={360} bind:value={flareSettings.streak.angle} on:input={function() { renderFlare(false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.streak.hue} on:input={function() { renderFlare(false, true); }} /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.streak.saturation} on:input={function() { renderFlare(false, true); }} /> <br />
    Thickness: <Slider min={0} max={200} bind:value={flareSettings.streak.thickness} on:input={function() { renderFlare(false, true); }} /> <br />
    Length: <Slider min={0} max={3210} bind:value={flareSettings.streak.width} on:input={function() { renderFlare(false, true); }} /> <br />
    Intensity: <Slider min={-25} max={50} bind:value={flareSettings.streak.intensity} on:input={function() { renderFlare(false, true); }} /> <br />
    Starring: <Slider min={1} max={8} bind:value={flareSettings.streak.count} on:input={function() { renderFlare(false, true); }} /> <br />
    Shift: <Slider min={0} max={100} bind:value={flareSettings.streak.shift} on:input={function() { renderFlare(false, true); }} /> <br />
</Collapsible>
<Collapsible title={"ring thing"}>
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.ring.alpha} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.ring.hue} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.ring.saturation} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Radius: <Slider min={0} max={810} bind:value={flareSettings.ring.radius} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Thickness: <Slider min={0} max={500} bind:value={flareSettings.ring.thickness} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Softness: <Slider min={0} max={50} bind:value={flareSettings.ring.blur} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Crop Size: <Slider min={0} max={810} bind:value={flareSettings.ring.cropSize} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Crop Hardness: <Slider min={0} max={100} bind:value={flareSettings.ring.cropHardness} on:input={function() { renderFlare(false, false, true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.ring.anamorph} on:input={function() { renderFlare(false, false, true); }} /> <br />
</Collapsible>
<Collapsible title={"Multi-Iris"}>
    Fill Alpha: <Slider min={0} max={100} bind:value={flareSettings.miIris.fillAlpha} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Fringe Alpha: <Slider min={0} max={100} bind:value={flareSettings.miIris.fringeAlpha} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Angle: <Slider min={0} max={360} bind:value={flareSettings.miIris.angle} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.miIris.hue} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.miIris.saturation} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Radius: <Slider min={0} max={810} bind:value={flareSettings.miIris.radius} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Sides: <Slider min={5} max={10} bind:value={flareSettings.miIris.sides} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Roundness: <Slider min={0} max={100} bind:value={flareSettings.miIris.roundness} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Fringe Size: <Slider min={0} max={100} bind:value={flareSettings.miIris.fringeSize} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Softness: <Slider min={0} max={30} bind:value={flareSettings.miIris.blur} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Count Towards: <Slider min={0} max={50} bind:value={flareSettings.miIris.countTowards} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Count Away: <Slider min={0} max={50} bind:value={flareSettings.miIris.countAway} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Spread: <Slider min={0} max={100} bind:value={flareSettings.miIris.spread} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Size Variance: <Slider min={0} max={100} bind:value={flareSettings.miIris.sizeVariance} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Perspective: <Slider min={0} max={100} bind:value={flareSettings.miIris.perspective} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Alpha Variance: <Slider min={0} max={100} bind:value={flareSettings.miIris.alphaVariance} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Random Seed: <Slider min={0} max={999} bind:value={flareSettings.miIris.seed} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.miIris.anamorph} on:input={function() { renderFlare(false, false, false, true); }} /> <br />
</Collapsible>
<Collapsible title={"Glow"}>
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.glow.alpha} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Hue: <Slider min={0} max={360} bind:value={flareSettings.glow.hue} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Saturation: <Slider min={0} max={100} bind:value={flareSettings.glow.saturation} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Radius: <Slider min={0} max={1200} bind:value={flareSettings.glow.radius} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Softness: <Slider min={0} max={200} bind:value={flareSettings.glow.softening} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
    Anamorph: <Slider min={0} max={100} bind:value={flareSettings.glow.anamorph} on:input={function() { renderFlare(false, false, false, false, true); }} /> <br />
</Collapsible>
</div>

<style>
    canvas {
        width: 600px;
    }
    :global(slider) {
        float: right;
    }
</style>