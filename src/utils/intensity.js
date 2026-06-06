/**
 * Applies a brightness threshold filter to a canvas context.
 * Remaps pixel values so that anything below the threshold becomes black,
 * and values above are stretched to fill the full 0–255 range.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context to filter.
 * @param {number} threshold - Threshold value (0–255). Higher = brighter output.
 */
export default function intensity(ctx, threshold) {
  const threshFunc = (val, thresh) => {
    return (255 / (255 - thresh)) * (val - 255 + thresh) + 255;
  };

  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      data[i + j] = threshFunc(data[i + j], threshold);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
