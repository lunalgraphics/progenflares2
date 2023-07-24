<script context="module">
    let current;
</script>

<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let hue;
    export let saturation;
    export let lightness;

    let inputElement;
    var hexValue = "#123456";
    $: hexValue = hsl2Hex({
        h: hue,
        s: saturation,
        l: lightness,
    });

    function hex2Hsl(hex="#000000") {
        var r = parseInt(hex.substring(1, 3), 16) / 255,
            g = parseInt(hex.substring(3, 5), 16) / 255,
            b = parseInt(hex.substring(5, 7), 16) / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l;
        l = (max + min) / 2;
        if (max == min) {
            h = 0;
            s = 0;
        }
        else {
            var d = max - min;
            if (l > 0.5) s = d / (2 - max - min);
            else s = d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + ((g < b)?6:0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h *= 60;
            s *= 100;
        }
        l *= 100;
        return {
            h: h,
            s: s,
            l: l,
        };
    }

    function hsl2Hex(hsl={h: 0, s: 100, l: 50}) {
        var l = hsl.l / 100;
        var a = hsl.s * Math.min(l, 1 - l) / 100;
        var hex = "#";
        for (var n of [0, 8, 4]) {
            var k = (n + hsl.h / 30) % 12;
            var color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            hex += Math.round(255 * color).toString(16).padStart(2, "0");
        }
        return hex;
    }

    function updateValues() {
        var hsl = hex2Hsl(hexValue);
        hue = Math.round(hsl.h);
        saturation = Math.round(hsl.s);
        lightness = Math.round(hsl.l);
        dispatch("input");
    }

    function onChange() {
        dispatch("change");
    }
</script>

<hslcolorpicker>
    <input type="color" bind:value={hexValue} bind:this={inputElement} on:input={updateValues} on:change={onChange} />
    <!--<code>{`h: ${hue}, s: ${saturation}, l: ${lightness}`}</code>-->
</hslcolorpicker>

<svelte:options accessors={true} />

<style>
    input[type=color] {
        padding: 1px 2px;
        height: 20px;
        outline: none!important;
        margin-bottom: 0!important;
        vertical-align: middle;
    }
</style>