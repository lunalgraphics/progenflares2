/**
 * Generates fractal noise textures using SVG feTurbulence filters.
 * Creates an inline SVG filter, renders it to canvas, then cleans up.
 */
export default class FractalNoise {
  canvas = document.createElement("canvas");
  svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");

  options = {
    baseFrequency: [0.01, 0.01],
    type: "fractalNoise",
    numOctaves: 10,
    seed: 1,
    stitchTiles: "stitch",
  };

  width = 1920;
  height = 1080;

  /**
   * Merge new options and regenerate the SVG filter markup.
   * @param {Object} options - Partial options to override defaults.
   */
  setOptions(options) {
    for (const opt in options) {
      this.options[opt] = options[opt];
    }
    this.svgFilter.innerHTML = `<feTurbulence
      baseFrequency="${this.options.baseFrequency.join(" ")}"
      type="${this.options.type}"
      numOctaves="${this.options.numOctaves}"
      seed="${this.options.seed}"
      stitchTiles="${this.options.stitchTiles}"
      color-interpolation-filters="linearRGB"
    />`;
  }

  /**
   * @param {number} width - Output texture width.
   * @param {number} height - Output texture height.
   * @param {Object} options - FeTurbulence filter options.
   */
  constructor(width, height, options) {
    // Generate a unique filter ID to avoid SVG collisions
    this.svgFilter.id = `fNoiseFilter${Math.random().toFixed(8).replace("0.", "")}`;
    this.svgFilter.setAttribute("x", "0%");
    this.svgFilter.setAttribute("y", "0%");
    this.svgFilter.setAttribute("width", "100%");
    this.svgFilter.setAttribute("height", "100%");
    this.setOptions(options);
    this.width = width;
    this.height = height;
  }

  /**
   * Render the noise texture to this.canvas.
   * Temporarily appends an SVG element to the DOM for filter reference.
   */
  render() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    const ctx = this.canvas.getContext("2d");
    ctx.restore();
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
    ctx.save();

    // Temporarily inject SVG filter into the DOM
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.appendChild(this.svgFilter);
    document.body.appendChild(svg);

    ctx.filter = `url(#${this.svgFilter.id})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    svg.remove();
  }
}
