import colorvibrance from "../utils/colorvibrance";

/**
 * Renders a polygonal iris/bokeh flare artifact.
 * Generates a regular polygon with configurable roundness, fill, fringe,
 * and blur — used for multi-iris and lens orb effects.
 */
export default class Iris {
  canvas = document.createElement("canvas");
  radius = 512;

  options = {
    roundness: 20,
    sides: 5,
    fillAlpha: 25,
    fringeAlpha: 50,
    fringeSize: 10,
    hue: 200,
    saturation: 100,
    blur: 5,
    angle: 0,
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

  /** Render the iris artifact to this.canvas. */
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

    // Build polygon path from polar coordinates with roundness interpolation
    ctx.beginPath();
    const polarPoints = []; // [radius, angle]
    let startAngle = (this.options.angle * Math.PI) / 180;

    for (let i = 0; i < this.options.sides; i++) {
      polarPoints.push([this.radius, startAngle]);

      const resolution = 360;
      for (let j = 0; j < resolution; j++) {
        const theta = ((j + 1) / resolution) * ((Math.PI * 2) / this.options.sides);
        const halfAngle = 0.5 * (Math.PI - (2 * Math.PI) / this.options.sides);

        // Calculate the straight-edge radius via sine rule
        const straightR =
          (this.radius / Math.sin(Math.PI - theta - halfAngle)) *
          Math.sin(halfAngle);

        // Interpolate between straight edge and circle based on roundness
        const r =
          straightR * (1 - this.options.roundness / 100) +
          this.radius * (this.options.roundness / 100);

        polarPoints.push([r, startAngle + theta]);
      }

      startAngle += (Math.PI * 2) / this.options.sides;
    }

    // Convert polar points to canvas path
    let firstPoint = true;
    for (const pt of polarPoints) {
      const [r, theta] = pt;
      const x = Math.cos(theta) * r + this.radius;
      const y = Math.sin(theta) * r + this.radius;
      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Draw fringe (outer glow)
    ctx.fillStyle = `hsl(0deg, 0%, ${this.options.fringeAlpha}%)`;
    ctx.fill();
    ctx.restore();
    ctx.save();

    // Inset fringe with blur
    ctx.fillStyle = "black";
    ctx.filter = `blur(${this.options.fringeSize}px)`;
    ctx.fill();
    ctx.restore();
    ctx.save();

    // Fill interior
    ctx.fillStyle = "white";
    ctx.globalAlpha = this.options.fillAlpha / 100;
    ctx.fill();
    ctx.restore();
    ctx.save();

    // Apply overall blur via buffer canvas
    const blurBuff = document.createElement("canvas");
    blurBuff.width = this.canvas.width;
    blurBuff.height = this.canvas.height;
    blurBuff.getContext("2d").drawImage(this.canvas, 0, 0);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.filter = `blur(${this.options.blur}px)`;
    ctx.drawImage(
      blurBuff,
      this.options.blur * 2,
      this.options.blur * 2,
      this.canvas.width - 4 * this.options.blur,
      this.canvas.height - 4 * this.options.blur
    );
    ctx.restore();
    ctx.save();

    // Colorize
    colorvibrance(ctx, this.options.hue, this.options.saturation);
    ctx.restore();
    ctx.save();
  }
}
