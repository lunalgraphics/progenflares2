function intensity(ctx, threshold) {
    var threshFunc = function(val, thresh) {
        return 255 / (255 - thresh) * (val - 255 + thresh) + 255;
    };
    var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        for (var j = 0; j < 3; j++) {
            data[i + j] = threshFunc(data[i + j], threshold);
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

export default intensity;