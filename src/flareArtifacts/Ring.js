import colorvibrance from "../utils/colorvibrance";

/**
 * Renders a ring/halo flare artifact using radial gradients.
 * Supports configurable thickness, blur, and vertical cropping with
 * gradient-based crop softness.
 */
export default class Ring {
  canvas = document.createElement("canvas");
  radius = 512;

  options = {
    thickness: 10,
    blur: 3,
    cropSize: 200,
    cropHardness: 50,
    hue: 200,
    saturation: 100,
  };

  /**
   * @param {number} radius - Half-size of the output canvas.
   * @param {Object} options - Partial options to override defaults.
   */
  constructor(radius, options) {
    this.radius = radius;
    this.setOptions(options);
  }

  /** Merge partial options into current options. */
  setOptions(options) {
    for (const opt in options) {
      this.options[opt] = options[opt];
    }
  }

  /** Render the ring artifact to this.canvas. */
  render() {
    this.canvas.width = Math.max(this.radius * 2, 2);
    this.canvas.height = Math.max(this.radius * 2, 2);

    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
    ctx.save();

    // Black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the ring using a radial gradient
    ctx.beginPath();
    const outerRadius = Math.max(this.radius - this.options.blur * 4, 2);
    ctx.arc(this.radius, this.radius, outerRadius, 0, 2 * Math.PI, true);

    const gradient = ctx.createRadialGradient(
      this.radius, this.radius, 0,
      this.radius, this.radius, outerRadius
    );
    gradient.addColorStop(0, "black");
    gradient.addColorStop(Math.max(1 - this.options.thickness / this.radius, 0), "black");
    gradient.addColorStop(1, "white");

    ctx.fillStyle = gradient;
    ctx.filter = `blur(${this.options.blur}px)`;
    ctx.fill();

    // Top crop gradient (fades ring at top edge)
    let cropGradient = ctx.createLinearGradient(0, 0, 0, this.options.cropSize);
    cropGradient.addColorStop(0, "black");
    cropGradient.addColorStop(this.options.cropHardness / 100, "black");
    cropGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = cropGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.options.cropSize);

    // Bottom crop gradient (fades ring at bottom edge)
    cropGradient = ctx.createLinearGradient(
      0, this.canvas.height - this.options.cropSize,
      0, this.canvas.height
    );
    cropGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    cropGradient.addColorStop(1 - this.options.cropHardness / 100, "black");
    cropGradient.addColorStop(1, "black");
    ctx.fillStyle = cropGradient;
    ctx.fillRect(0, this.canvas.height - this.options.cropSize, this.canvas.width, this.options.cropSize);

    // Colorize
    colorvibrance(ctx, this.options.hue, this.options.saturation);
    ctx.restore();
    ctx.save();
  }
}
