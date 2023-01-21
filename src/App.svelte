<script>
    import Collapsible from "./Collapsible.svelte";
    import colorvibrance from "./colorvibrance";
    import SpotComponent from "./SpotComponent";
    import Slider from "./Slider.svelte";
    import drawComponent from "./drawComponent";

    var flareComponents = {
        hotspot: new SpotComponent(256, {
            deformationFrequency: 0.006,
        }),
        streak: new SpotComponent(256, {
            deformationAmount: 0,
            intensity: 0,
        })
    };

    var flareSettings = {
        positioning: {
            x: 960,
            y: 540,
            pivotX: 960,
            pivotY: 540
        },
        hotspot: {
            radius: 500,
            intensity: 5,
        },
        streak: {
            thickness: 64,
            width: 1600,
            intensity: 3,
        }
    };

    var baseCanvas;
    
    function renderFlare(renderHotspot=false, renderStreak=false) {
        if (renderHotspot) {
            flareComponents.hotspot.radius = flareSettings.hotspot.radius / 2;
            flareComponents.hotspot.options.intensity = flareSettings.hotspot.intensity;
            flareComponents.hotspot.render();
        }
        if (renderStreak) {
            flareComponents.streak.radius = Math.floor(flareSettings.streak.thickness / 2);
            flareComponents.streak.options.intensity = flareSettings.streak.intensity;
            flareComponents.streak.render();
        }

        var ctx = baseCanvas.getContext("2d");
        ctx.restore();
        ctx.save();
        ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
        drawComponent(ctx, flareComponents.hotspot, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.hotspot.radius * 2, flareSettings.hotspot.radius * 2);
        drawComponent(ctx, flareComponents.streak, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width, flareSettings.streak.thickness);
    }

    window.onload = function() { renderFlare(true, true); };
</script>

<canvas bind:this={baseCanvas} width={1920} height={1080}></canvas>

<br uh />
<Collapsible title={"positioning"}>
    X: <Slider min={0} max={1920} bind:value={flareSettings.positioning.x} on:input={function() { renderFlare(); }}></Slider> <br />
    Y: <Slider min={0} max={1080} bind:value={flareSettings.positioning.y} on:input={function() { renderFlare(); }}></Slider> <br />
    Pivot X: <Slider min={0} max={1920} bind:value={flareSettings.positioning.pivotX} on:input={function() { renderFlare(); }}></Slider> <br />
    Pivot Y: <Slider min={0} max={1080} bind:value={flareSettings.positioning.pivotY} on:input={function() { renderFlare(); }}></Slider> <br />
</Collapsible>
<Collapsible title={"hi"}>
    Size: <Slider min={0} max={900} bind:value={flareSettings.hotspot.radius} on:input={function() { renderFlare(true); }}></Slider> <br />
    Intensity: <Slider min={0} max={50} bind:value={flareSettings.hotspot.intensity} on:input={function() { renderFlare(true); }}></Slider> <br />
</Collapsible>
<Collapsible title={"anamorphic streak"}>
    Thickness: <Slider min={0} max={100} bind:value={flareSettings.streak.thickness} on:input={function() { renderFlare(false, true); }}></Slider> <br />
    Length: <Slider min={0} max={3210} bind:value={flareSettings.streak.width} on:input={function() { renderFlare(false, true); }}></Slider> <br />
    Intensity: <Slider min={0} max={50} bind:value={flareSettings.streak.intensity} on:input={function() { renderFlare(false, true); }}></Slider> <br />
</Collapsible>

<style>
    canvas {
        width: 600px;
    }
</style>