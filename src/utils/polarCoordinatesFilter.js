/**
 * Converts a rectangular canvas image into polar coordinates.
 * Maps each output pixel (x, y) to an input pixel using angle → x, radius → y.
 * This creates the classic "rectangular to polar" warp effect.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context to transform in-place.
 */
export default function polarCoordinatesFilter(ctx) {
  const canvas = ctx.canvas;
  const inputImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const outputImageData = new ImageData(canvas.width, canvas.height);
  const inputData = inputImageData.data;
  const outputData = outputImageData.data;
  const origin = { x: canvas.width / 2, y: canvas.height / 2 };

  let outputX = -1;
  let outputY = 0;

  for (let i = 0; i < outputData.length; i += 4) {
    outputX++;
    if (outputX >= canvas.width) {
      outputY++;
      outputX = 0;
    }

    const angle = Math.atan2(outputY - origin.y, outputX - origin.x);
    const radius = Math.sqrt(
      Math.pow(outputX - origin.x, 2) + Math.pow(outputY - origin.y, 2)
    );

    // Skip pixels outside the inscribed circle
    if (radius > canvas.width / 2) {
      continue;
    }

    const inputX = Math.round((angle / Math.PI / 2) * canvas.width);
    const inputY = Math.round(radius * 2);
    const inputI = 4 * (inputY * canvas.width + inputX);

    outputData[i] = inputData[inputI];
    outputData[i + 1] = inputData[inputI + 1];
    outputData[i + 2] = inputData[inputI + 2];
    outputData[i + 3] = 255;
  }

  ctx.putImageData(outputImageData, 0, 0);
}
