<script>
    import Collapsible from "./Collapsible.svelte";
    import colorvibrance from "./colorvibrance";
    import SpotComponent from "./SpotComponent";
    import Slider from "./Slider.svelte";
    import drawComponent from "./drawComponent";

    var flareComponents = {
        hotspot: new SpotComponent(256, {})
    };

    var flareSettings = {
        positioning: {
            x: 960,
            y: 540,
            pivotX: 960,
            pivotY: 540
        },
        hotspot: {
            radius: 500
        }
    };

    var baseCanvas;
    
    function renderFlare(renderHotspot=false) {
        if (renderHotspot) {
            flareComponents.hotspot.radius = flareSettings.hotspot.radius;
            
            flareComponents.hotspot.render();
        }

        var ctx = baseCanvas.getContext("2d");
        ctx.restore();
        ctx.save();
        ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
        drawComponent(ctx, flareComponents.hotspot, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.hotspot.radius * 2, flareSettings.hotspot.radius * 2);
    }

    window.onload = renderFlare;
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
    <Slider min={0} max={900} bind:value={flareSettings.hotspot.radius} on:input={function() { renderFlare(true); }}></Slider>
    <button>{flareSettings.hotspot.radius}</button>
</Collapsible>

<style>
    canvas {
        width: 600px;
    }
</style>