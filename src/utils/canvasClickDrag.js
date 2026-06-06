/**
 * Svelte action that enables click-and-drag interaction on a canvas element.
 * Dispatches a custom "clickDrag" event with relative canvas coordinates
 * whenever the user clicks or drags on the canvas.
 *
 * Usage in Svelte: <canvas use:canvasClickDrag on:clickDrag={handler} />
 *
 * @param {HTMLCanvasElement} node - The canvas element to attach to.
 * @returns {{ destroy: () => void }} Cleanup function for Svelte action lifecycle.
 */
export default function canvasClickDrag(node) {
  let mouseDown = false;
  const relMousePos = { x: 0, y: 0 };

  /** Convert client coordinates to canvas-relative coordinates */
  const setMousePos = (e) => {
    const hitbox = node.getBoundingClientRect();
    const truePos = {
      x: e.clientX - hitbox.x,
      y: e.clientY - hitbox.y,
    };
    const scale = hitbox.width / node.width;
    relMousePos.x = Math.round(truePos.x / scale);
    relMousePos.y = Math.round(truePos.y / scale);
  };

  /** Dispatch the custom event with current position */
  const dispatchEvt = () => {
    node.dispatchEvent(
      new CustomEvent("clickDrag", { detail: relMousePos })
    );
  };

  const handleMouseDown = (e) => {
    mouseDown = true;
    setMousePos(e);
    dispatchEvt();
  };

  const handleMouseUp = () => {
    mouseDown = false;
  };

  const handleMouseMove = (e) => {
    if (mouseDown) {
      setMousePos(e);
      dispatchEvt();
    }
  };

  node.addEventListener("mousedown", handleMouseDown);
  document.body.addEventListener("mousemove", handleMouseMove);
  document.body.addEventListener("mouseup", handleMouseUp);

  return {
    destroy() {
      node.removeEventListener("mousedown", handleMouseDown);
      document.body.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseup", handleMouseUp);
    },
  };
}
