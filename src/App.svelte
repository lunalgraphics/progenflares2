<script>
    import Collapsible from "./Collapsible.svelte";
    import colorvibrance from "./colorvibrance";
    import SpotComponent from "./SpotComponent";
    import Slider from "./Slider.svelte";

    var flareComponents = {
        hotspot: new SpotComponent(256, {})
    };

    var flareSettings = {
        hotspot: {
            radius: 50
        }
    };
    
    function renderFlare(renderHotspot=false) {
        if (renderHotspot) flareComponents.hotspot.render();
    }
</script>

<Collapsible title={"hi"}>
    <Slider min={0} max={100} bind:value={flareSettings.hotspot.radius}></Slider>
    <button>{flareSettings.hotspot.radius}</button>
</Collapsible>

<style>
</style>