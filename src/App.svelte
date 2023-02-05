<script>
    import Collapsible from "./Collapsible.svelte";
    import colorvibrance from "./colorvibrance";
    import SpotComponent from "./SpotComponent";
    import RingComponent from "./RingComponent";
    import Slider from "./Slider.svelte";
    import drawComponent from "./drawComponent";
    import canvasClickDrag from "./canvasClickDrag";

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
        },
        streak: {
            thickness: 64,
            width: 1600,
            intensity: 5,
            count: 1,
            angle: 0,
        },
        ring: {
            radius: 400,
            thickness: 81,
            blur: 10,
            cropSize: 0,
            cropHardness: 50,
            alpha: 21,
        }
    };

    var baseCanvas;
    
    function renderFlare(renderHotspot=false, renderStreak=false, renderRing=false) {
        if (renderHotspot) {
            flareComponents.hotspot.radius = Math.floor(flareSettings.hotspot.radius / flareSettings.downscaling);
            flareComponents.hotspot.options.intensity = flareSettings.hotspot.intensity / flareSettings.downscaling;
            flareComponents.hotspot.render();
        }
        if (renderStreak) {
            flareComponents.streak.radius = Math.floor(flareSettings.streak.thickness / flareSettings.downscaling);
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
        drawComponent(ctx, flareComponents.ring, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.ring.radius, flareSettings.ring.radius, 0, flareSettings.ring.alpha);
    }

    window.onload = function() { renderFlare(true, true, true); };

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

<style>
    canvas {
        width: 600px;
    }
</style>