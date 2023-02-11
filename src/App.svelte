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
        },
        streak: {
            thickness: 64,
            width: 1600,
            intensity: 5,
            count: 1,
            angle: 0,
        },
        ring: {
            radius: 200,
            thickness: 40,
            blur: 5,
            cropSize: 0,
            cropHardness: 50,
            alpha: 21,
        },
        miIris: {
            radius: 81,
            sides: 5,
            roundness: 20,
            fillAlpha: 25,
            fringeAlpha: 50,
            fringeSize: 10,
            countAway: 5,
            countTowards: 12,
            spread: 30,
            sizeVariance: 40,
            perspective: 100,
            alphaVariance: 50,
            seed: 123,
        }
    };

    var baseCanvas;
    
    function renderFlare(renderHotspot=false, renderStreak=false, renderRing=false, renderMI=false) {
        if (renderHotspot) {
            flareComponents.hotspot.radius = Math.floor(flareSettings.hotspot.radius / flareSettings.downscaling);
            flareComponents.hotspot.options.intensity = flareSettings.hotspot.intensity / flareSettings.downscaling;
            flareComponents.hotspot.options.deformationAmount = flareSettings.hotspot.deformationAmount;
            flareComponents.hotspot.options.deformationFrequency = flareSettings.hotspot.deformationFrequency;
            flareComponents.hotspot.render();
        }
        if (renderStreak) {
            flareComponents.streak.radius = Math.floor(flareSettings.streak.thickness * 2 / flareSettings.downscaling);
            flareComponents.streak.options.intensity = flareSettings.streak.intensity / flareSettings.downscaling;
            flareComponents.streak.render();
        }
        if (renderRing) {
            flareComponents.ring.radius = Math.floor(flareSettings.ring.radius / flareSettings.downscaling);
            flareComponents.ring.options.thickness = flareSettings.ring.thickness / flareSettings.downscaling;
            flareComponents.ring.options.blur = flareSettings.ring.blur / flareSettings.downscaling;
            flareComponents.ring.options.cropSize = flareSettings.ring.cropSize / flareSettings.downscaling;
            flareComponents.ring.options.cropHardness = flareSettings.ring.cropHardness;
            flareComponents.ring.render();
        }
        if (renderMI) {
            flareComponents.miIris.radius = Math.floor(flareSettings.miIris.radius / flareSettings.downscaling);
            flareComponents.miIris.options.sides = flareSettings.miIris.sides;
            flareComponents.miIris.options.roundness = flareSettings.miIris.roundness;
            flareComponents.miIris.options.fillAlpha = flareSettings.miIris.fillAlpha;
            flareComponents.miIris.options.fringeAlpha = flareSettings.miIris.fringeAlpha;
            flareComponents.miIris.options.fringeSize = Math.floor(flareSettings.miIris.fringeSize / flareSettings.downscaling);
            flareComponents.miIris.render();
        }

        var ctx = baseCanvas.getContext("2d");
        ctx.restore();
        ctx.save();
        ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
        drawComponent(ctx, flareComponents.hotspot, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.hotspot.radius * 2, flareSettings.hotspot.radius * 2);
        var streakAngle = flareSettings.streak.angle;
        for (var i = 0; i < flareSettings.streak.count; i++) {
            drawComponent(ctx, flareComponents.streak, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width, flareSettings.streak.thickness, streakAngle);
            streakAngle += 180 / flareSettings.streak.count;
        }
        drawComponent(ctx, flareComponents.ring, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.ring.radius * 2, flareSettings.ring.radius * 2, 0, flareSettings.ring.alpha);

        var miRng = seedrandom(flareSettings.miIris.seed);
        for (var i = 1; i < flareSettings.miIris.countTowards; i++) {
            var irisPosition = {
                x: flareSettings.positioning.x + i * (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.miIris.spread / 100,
                y: flareSettings.positioning.y + i * (flareSettings.positioning.pivotY - flareSettings.positioning.y) * flareSettings.miIris.spread / 100,
            };
            var irisScale = 1 + (miRng() - 0.5) * 2 * flareSettings.miIris.sizeVariance / 100;
            irisScale -= (1 - i / flareSettings.miIris.countTowards) * flareSettings.miIris.perspective / 100;
            drawComponent(ctx, flareComponents.miIris, irisPosition.x, irisPosition.y, flareSettings.miIris.radius * 2 * irisScale, flareSettings.miIris.radius * 2 * irisScale, 0, 100 - flareSettings.miIris.alphaVariance * miRng());
        }
        for (var i = 1; i < flareSettings.miIris.countAway; i++) {
            var irisPosition = {
                x: flareSettings.positioning.x - i * (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.miIris.spread / 100,
                y: flareSettings.positioning.y - i * (flareSettings.positioning.pivotY - flareSettings.positioning.y) * flareSettings.miIris.spread / 100,
            };
            var irisScale = 1 + (miRng() - 0.5) * 2 * flareSettings.miIris.sizeVariance / 100;
            irisScale -= (1 - i / flareSettings.miIris.countTowards) * flareSettings.miIris.perspective / 100;
            drawComponent(ctx, flareComponents.miIris, irisPosition.x, irisPosition.y, flareSettings.miIris.radius * 2 * irisScale, flareSettings.miIris.radius * 2 * irisScale, 0, 100 - flareSettings.miIris.alphaVariance * miRng());
        }
    }

    window.onload = function() { renderFlare(true, true, true, true); };

    function handleClickDrag(e) {
        //console.log(e.detail);
        flareSettings.positioning.x = e.detail.x;
        flareSettings.positioning.y = e.detail.y;
        renderFlare();
    }
</script>

<canvas bind:this={baseCanvas} use:canvasClickDrag on:clickDrag={handleClickDrag} width={flareSettings.dimensions.width} height={flareSettings.dimensions.height}></canvas>

<br uh />

Preview quality
<select bind:value={flareSettings.downscaling} on:change={function() { renderFlare(true, true, true); }}>
    <option value={1}>100%</option>
    <option value={2}>50%</option>
    <option value={4}>25%</option>
</select>
<br uh />

<Collapsible title={"positioning"} collapsed={false}>
    X: <Slider min={0} max={flareSettings.dimensions.width} bind:value={flareSettings.positioning.x} on:input={function() { renderFlare(); }}></Slider> <br />
    Y: <Slider min={0} max={flareSettings.dimensions.height} bind:value={flareSettings.positioning.y} on:input={function() { renderFlare(); }}></Slider> <br />
    Pivot X: <Slider min={0} max={flareSettings.dimensions.width} bind:value={flareSettings.positioning.pivotX} on:input={function() { renderFlare(); }}></Slider> <br />
    Pivot Y: <Slider min={0} max={flareSettings.dimensions.height} bind:value={flareSettings.positioning.pivotY} on:input={function() { renderFlare(); }}></Slider> <br />
</Collapsible>
<Collapsible title={"hi"}>
    Size: <Slider min={0} max={900} bind:value={flareSettings.hotspot.radius} on:input={function() { renderFlare(true); }}></Slider> <br />
    Intensity: <Slider min={0} max={50} bind:value={flareSettings.hotspot.intensity} on:input={function() { renderFlare(true); }}></Slider> <br />
    Rays Frequency: <Slider min={0} max={0.05} step={0.001} bind:value={flareSettings.hotspot.deformationFrequency} on:input={function() { renderFlare(true); }}></Slider> <br />
    Rays Definition: <Slider min={0} max={2.1} step={0.01} bind:value={flareSettings.hotspot.deformationAmount} on:input={function() { renderFlare(true); }}></Slider> <br />
</Collapsible>
<Collapsible title={"anamorphic streak"}>
    Thickness: <Slider min={0} max={200} bind:value={flareSettings.streak.thickness} on:input={function() { renderFlare(false, true); }}></Slider> <br />
    Length: <Slider min={0} max={3210} bind:value={flareSettings.streak.width} on:input={function() { renderFlare(false, true); }}></Slider> <br />
    Intensity: <Slider min={-25} max={50} bind:value={flareSettings.streak.intensity} on:input={function() { renderFlare(false, true); }}></Slider> <br />
    Starring: <Slider min={1} max={8} bind:value={flareSettings.streak.count} on:input={function() { renderFlare(false, true); }}></Slider> <br />
</Collapsible>
<Collapsible title={"ring thing"}>
    Radius: <Slider min={0} max={810} bind:value={flareSettings.ring.radius} on:input={function() { renderFlare(false, false, true); }}></Slider> <br />
    Thickness: <Slider min={0} max={500} bind:value={flareSettings.ring.thickness} on:input={function() { renderFlare(false, false, true); }}></Slider> <br />
    Softness: <Slider min={0} max={50} bind:value={flareSettings.ring.blur} on:input={function() { renderFlare(false, false, true); }}></Slider> <br />
    Alpha: <Slider min={0} max={100} bind:value={flareSettings.ring.alpha} on:input={function() { renderFlare(false, false, true); }}></Slider> <br />
    Crop Size: <Slider min={0} max={810} bind:value={flareSettings.ring.cropSize} on:input={function() { renderFlare(false, false, true); }}></Slider> <br />
    Crop Hardness: <Slider min={0} max={100} bind:value={flareSettings.ring.cropHardness} on:input={function() { renderFlare(false, false, true); }}></Slider> <br />
</Collapsible>
<Collapsible title={"Multi-Iris"}>
    Radius: <Slider min={0} max={810} bind:value={flareSettings.miIris.radius} on:input={function() { renderFlare(false, false, false, true); }}></Slider> <br />
    Sides: <Slider min={5} max={10} bind:value={flareSettings.miIris.sides} on:input={function() { renderFlare(false, false, false, true); }}></Slider> <br />
    Roundness: <Slider min={0} max={100} bind:value={flareSettings.miIris.roundness} on:input={function() { renderFlare(false, false, false, true); }}></Slider> <br />
    Fill: <Slider min={0} max={100} bind:value={flareSettings.miIris.fillAlpha} on:input={function() { renderFlare(false, false, false, true); }}></Slider> <br />
    Fringe Size: <Slider min={0} max={100} bind:value={flareSettings.miIris.fringeSize} on:input={function() { renderFlare(false, false, false, true); }}></Slider> <br />
    Fringe Alpha: <Slider min={0} max={100} bind:value={flareSettings.miIris.fringeAlpha} on:input={function() { renderFlare(false, false, false, true); }}></Slider> <br />
</Collapsible>

<style>
    canvas {
        width: 600px;
    }
</style>