/**
 * Undo/Redo history manager for flare settings.
 *
 * Stores snapshots of the settings state as JSON strings.
 * Supports a configurable max history depth to limit memory usage.
 *
 * Usage:
 *   history.push(flareSettings)   — save current state (call after user commits a change)
 *   history.undo()                — returns the previous state, or null if at start
 *   history.redo()                — returns the next state, or null if at end
 *   history.canUndo / history.canRedo — boolean getters
 */

var MAX_HISTORY = 100;

var stack = [];
var pointer = -1;

/**
 * Push a new state snapshot onto the history stack.
 * Clears any redo states ahead of the current pointer.
 *
 * @param {Object} state - The flareSettings object to snapshot.
 */
export function push(state) {
  // Discard any redo history ahead of current position
  stack = stack.slice(0, pointer + 1);

  // Add new snapshot
  stack.push(JSON.stringify(state));
  pointer = stack.length - 1;

  // Trim old history if over limit
  if (stack.length > MAX_HISTORY) {
    stack.shift();
    pointer--;
  }
}

/**
 * Move back one step in history.
 * @returns {Object|null} The restored settings object, or null if nothing to undo.
 */
export function undo() {
  if (pointer <= 0) return null;
  pointer--;
  return JSON.parse(stack[pointer]);
}

/**
 * Move forward one step in history.
 * @returns {Object|null} The restored settings object, or null if nothing to redo.
 */
export function redo() {
  if (pointer >= stack.length - 1) return null;
  pointer++;
  return JSON.parse(stack[pointer]);
}

/** @returns {boolean} Whether undo is available */
export function canUndo() {
  return pointer > 0;
}

/** @returns {boolean} Whether redo is available */
export function canRedo() {
  return pointer < stack.length - 1;
}

/** Clear all history (e.g. on new project) */
export function clear() {
  stack = [];
  pointer = -1;
}
