import colorvibrance from "../utils/colorvibrance";
import PrerenderedEllipticalGradient from "../utils/EllipticalGradient";
import FractalNoise from "../utils/FractalNoise";
import polarCoordinatesFilter from "../utils/polarCoordinatesFilter";
import intensity from "../utils/intensity";

/**
 * Renders a radial flare "spot" artifact with fractal noise deformation.
 * Used for hotspots, streaks (source texture), and glows.
 *
 * Pipeline: elliptical gradient → fractal noise warp → intensity threshold
 *           → colorize → polar coordinates transform.
 */
export default class Spot {
  canvas = document.createElement("canvas");

  options = {
    intensity: 10,
    deformationFrequency: 0.006,
    deformationAmount: 1.6,
    deformationSeed: 1,
    deformationOctaves: 10,
    hue: 200,
    saturation: 100,
    angle: 0,
  };

  radius = 1024;

  /**
   * @param {number} radius - Half-size of the output canvas.
   * @param {Object} options - Partial options to override defaults.
   */
  constructor(radius, options) {
    this.radius = radius;
    for (const opt in options) {
      this.options[opt] = options[opt];
    }
  }

  /** Render the spot artifact to this.canvas. */
  render() {
    this.canvas.width = Math.max(this.radius * 2, 2);
    this.canvas.height = Math.max(this.radius * 2, 2);

    const ctx = this.canvas.getContext("2d");
    ctx.restore();
    ctx.save();

    // Base elliptical gradient
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(
      PrerenderedEllipticalGradient.canvas,
      0, 0,
      this.canvas.width, this.canvas.height
    );

    // Generate noise deformation texture
    const deformationTexture = new FractalNoise(1024, 1024, {
      baseFrequency: [this.options.deformationFrequency, 0],
      seed: this.options.deformationSeed,
      numOctaves: this.options.deformationOctaves,
    });
    deformationTexture.render();

    // Apply deformation via soft-light blending
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.filter = `saturate(0) contrast(${this.options.deformationAmount})`;
    const deformationOffset = this.canvas.width * this.options.angle / 360;
    ctx.drawImage(deformationTexture.canvas, deformationOffset, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(deformationTexture.canvas, deformationOffset - this.canvas.width, 0, this.canvas.width, this.canvas.height);

    // Apply intensity threshold
    intensity(ctx, this.options.intensity * 255 / 100);

    // Colorize the result
    ctx.restore();
    ctx.save();
    colorvibrance(ctx, this.options.hue, this.options.saturation);

    // Convert to polar coordinates for the radial effect
    polarCoordinatesFilter(ctx);
  }
}
