/**
 * Generates a pre-rendered elliptical gradient texture using a circular
 * ease-out luminance curve. Used as a base radial falloff for flare spots.
 */
class EllipticalGradient {
  canvas = document.createElement("canvas");

  /**
   * Compute pixel luminance based on vertical distance.
   * Uses a circular ease-out curve: 1 - sqrt(1 - (d/max - 1)^2)
   *
   * @param {number} distance - Current distance from top edge.
   * @param {number} maxDistance - Maximum distance (canvas height).
   * @returns {number} Normalized luminance value (0–1).
   */
  getLuma(distance, maxDistance) {
    return 1 - Math.sqrt(1 - Math.pow(distance / maxDistance - 1, 2));
  }

  constructor() {
    const canv = this.canvas;
    canv.width = 2048;
    canv.height = 2048;

    const ctx = canv.getContext("2d");
    ctx.restore();
    ctx.save();
    ctx.fillRect(0, 0, canv.width, canv.height);

    // Build gradient via direct pixel manipulation
    const iData = ctx.getImageData(0, 0, canv.width, canv.height);
    const data = iData.data;

    for (let i = 0; i < data.length; i += 4) {
      const distFromTop = Math.floor(i / 4 / canv.width);
      const brightness = this.getLuma(distFromTop, canv.height) * 255;
      data[i] = brightness;
      data[i + 1] = brightness;
      data[i + 2] = brightness;
    }

    ctx.putImageData(iData, 0, 0);
  }
}

/**
 * Singleton that holds a pre-rendered elliptical gradient canvas.
 * Avoids re-generating the expensive gradient on every Spot render.
 */
class PrerenderedEllipticalGradient {
  static canvas = new EllipticalGradient().canvas;
}

export default PrerenderedEllipticalGradient;
