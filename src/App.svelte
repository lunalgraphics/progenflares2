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
        drawComponent(ctx, flareComponents.hotspot, 960, 540, flareSettings.hotspot.radius * 2, flareSettings.hotspot.radius * 2);
    }

    window.onload = renderFlare;
</script>

<canvas bind:this={baseCanvas} width={1920} height={1080}></canvas>

<br uh />
<Collapsible title={"hi"}>
    <Slider min={0} max={900} bind:value={flareSettings.hotspot.radius} on:input={function() { renderFlare(true); }}></Slider>
    <button>{flareSettings.hotspot.radius}</button>
</Collapsible>

<style>
    canvas {
        width: 600px;
    }
</style>