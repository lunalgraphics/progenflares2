<script>
    import Collapsible from "./Collapsible.svelte";
    import colorvibrance from "./colorvibrance";
    import SpotComponent from "./SpotComponent";

    var flareComponents = {
        hotspot: new SpotComponent(256, {})
    };
    
    function renderFlare(renderHotspot=false) {
        if (renderHotspot) flareComponents.hotspot.render();
    }
</script>

<Collapsible title={"hi"}>Hello</Collapsible>

<style>
</style>