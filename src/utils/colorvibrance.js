/**
 * Colorizes a black-background canvas overlay using HSL soft-light blending.
 * Applies the color twice for stronger saturation.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D context to colorize.
 * @param {number} [hue=200] - Hue angle in degrees (0–360).
 * @param {number} [saturation=100] - Saturation percentage (0–100).
 */
export default function colorvibrance(ctx, hue = 200, saturation = 100) {
  ctx.save();

  const color = `hsl(${hue}deg, ${saturation}%, ${50 - saturation / 4}%)`;
  ctx.fillStyle = color;
  ctx.globalCompositeOperation = "soft-light";

  // Double-apply for richer color intensity
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.restore();
}
