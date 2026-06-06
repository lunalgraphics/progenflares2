/**
 * Utility that splits a source canvas into left/right halves.
 * Used to create asymmetric streak effects where each half can be
 * drawn with different lengths/offsets.
 */
export default class Half {
  canvas = document.createElement("canvas");

  /**
   * Set the canvas content from a source, optionally clearing halves.
   *
   * @param {HTMLCanvasElement} source - Source canvas to copy from.
   * @param {number} width - Target width.
   * @param {number} height - Target height.
   * @param {boolean} [leftHalf=true] - Whether to keep the left half.
   * @param {boolean} [rightHalf=true] - Whether to keep the right half.
   */
  setCanvas(source, width, height, leftHalf = true, rightHalf = true) {
    this.canvas.width = Math.max(Math.round(width / 2) * 2, 2);
    this.canvas.height = Math.max(height, 2);

    const ctx = this.canvas.getContext("2d");
    ctx.drawImage(source, 0, 0, this.canvas.width, this.canvas.height);

    if (!leftHalf) {
      ctx.clearRect(0, 0, this.canvas.width / 2, this.canvas.height);
    }
    if (!rightHalf) {
      ctx.clearRect(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height);
    }
  }

  /**
   * @param {HTMLCanvasElement} source - Source canvas.
   * @param {number} width - Target width.
   * @param {number} height - Target height.
   * @param {boolean} [leftHalf=true] - Keep left half.
   * @param {boolean} [rightHalf=true] - Keep right half.
   */
  constructor(source, width, height, leftHalf = true, rightHalf = true) {
    this.setCanvas(source, width, height, leftHalf, rightHalf);
  }
}
