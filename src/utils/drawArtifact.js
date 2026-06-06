/**
 * Composites a flare artifact onto the main canvas with screen blending.
 * Handles positioning, rotation, scaling, opacity, and optional hue shift.
 *
 * @param {CanvasRenderingContext2D} ctx - Destination canvas context.
 * @param {Object} component - Artifact instance with a .canvas property.
 * @param {number} centerX - X position to draw the artifact center.
 * @param {number} centerY - Y position to draw the artifact center.
 * @param {number} width - Draw width of the artifact.
 * @param {number} height - Draw height of the artifact.
 * @param {number} [angle=0] - Rotation angle in degrees.
 * @param {number} [opacity=100] - Opacity percentage (0–100).
 * @param {number} [hueshift=0] - Hue rotation in degrees.
 * @param {number} [scaler=1] - Additional uniform scale factor.
 */
export default function drawArtifact(
  ctx,
  component,
  centerX,
  centerY,
  width,
  height,
  angle = 0,
  opacity = 100,
  hueshift = 0,
  scaler = 1
) {
  if (width <= 0 || height <= 0 || opacity <= 0 || scaler <= 0) return;

  ctx.restore();
  ctx.save();

  ctx.translate(centerX, centerY);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.globalAlpha = opacity / 100;
  ctx.globalCompositeOperation = "screen";

  if (hueshift !== 0) {
    ctx.filter = `hue-rotate(${hueshift}deg)`;
  }

  ctx.drawImage(
    component.canvas,
    (-width / 2) * scaler,
    (-height / 2) * scaler,
    width * scaler,
    height * scaler
  );

  ctx.restore();
  ctx.save();
}
