<script context="module">
    let current;
</script>

<script>
    export let plus = true;
    export let size = 12;
    export let color = "#000000";
    export let thickness = 2;
    export let style = "";
</script>

<div style={style} style:display="inline-block"
    style:width="{size}px" style:height="{size}px"
    style:position="relative">
    <!-- horizontal -->
    <div style:position="absolute"
        style:left="{size / 2}px"
        style:top="{size / 2}px"
        style:transform="translate(-50%, -50%)"
        style:width="{size}px" style:height="{thickness}px"
        style:background-color={color}></div>
    <!-- vertical -->
    <div style:position="absolute"
        style:left="{size / 2}px"
        style:top="{size / 2}px"
        style:transform="translate(-50%, -50%)"
        style:width="{thickness}px" style:height="{plus?size:0}px"
        style:background-color={color}
        style:transition="height 0.3s"></div>
</div>

<style>
</style>