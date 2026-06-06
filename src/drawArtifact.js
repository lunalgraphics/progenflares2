function drawArtifact(ctx, component, centerX, centerY, width, height, angle=0, opacity=100, hueshift=0, scaler=1) {
    if (width <= 0 || height <= 0 || opacity <= 0 || scaler <= 0) return;

    ctx.restore();
    ctx.save();
    
    ctx.translate(centerX, centerY);
    ctx.rotate(angle * Math.PI / 180); // degrees
    ctx.globalAlpha = opacity / 100;
    ctx.globalCompositeOperation = "screen";
    if (hueshift > 0 || hueshift < 0) ctx.filter = `hue-rotate(${hueshift}deg)`;
    ctx.drawImage(component.canvas, -width / 2 * scaler, -height / 2 * scaler, width * scaler, height * scaler);

    ctx.restore();
    ctx.save();
}

module.exports = drawArtifact;