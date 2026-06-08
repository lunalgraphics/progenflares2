/**
 * Progen Flares 2 — Photopea Plugin Entry Point
 *
 * Launches the flare editor in a popup window and communicates with
 * Photopea via the Photopea JS API to export the final flare as a
 * screen-blended layer on the active document.
 */

const $ = (selector) => document.querySelector(selector);
const pea = new Photopea(window.parent);

// ─── Flare Layer Export ──────────────────────────────────────────────

/**
 * Receives the final rendered flare image from the popup and places it
 * as a new screen-blended layer in the active Photopea document.
 *
 * @param {Array} data - Message array where data[1] is a base64 data URI.
 */
async function handleFinalImage(data) {
  const b64uri = data[1];
  await pea.runScript("app.activeDocument.activeLayer = app.activeDocument.layers[0];");
  await pea.openFromURL(b64uri);
  await pea.runScript("app.activeDocument.activeLayer.blendMode = 'scrn';");
  await pea.runScript("app.activeDocument.activeLayer.name = 'Lens Flare (Progen Flares 2)';");
}

// ─── Popup Window ────────────────────────────────────────────────────

/**
 * Opens the flare editor UI in a centered popup window and sets up
 * message passing for the reference image and final export.
 *
 * @param {number} width - Document width in pixels.
 * @param {number} height - Document height in pixels.
 * @param {string} imgURI - Base64 data URI of the current document composite.
 * @returns {Window|null} The popup window reference, or null if blocked.
 */
function createPopup(width, height, imgURI) {
  const pluginURL = new URL("./frame-contents/index.html", location);
  pluginURL.searchParams.set("popupPlugin", "yeah");
  pluginURL.searchParams.set("docWidth", width);
  pluginURL.searchParams.set("docHeight", height);

  const popupOptions = {
    width: 1400,
    height: 700,
    left: Math.round(window.outerWidth / 2 - 700),
    top: Math.round(window.outerHeight / 2 - 350),
  };

  const windowFeatures = Object.entries(popupOptions)
    .map(([key, val]) => `${key}=${val}`)
    .join(",");

  const popup = window.open(pluginURL, "_blank", windowFeatures);

  window.addEventListener("message", (e) => {
    if (e.data[0] === "pluginStatus" && e.data[1] === "ready") {
      popup.window.postMessage(["refImage", imgURI]);
    }
    if (e.data[0] === "finalImage") {
      handleFinalImage(e.data);
      popup.window.close();
    }
  });

  return popup;
}

// ─── Plugin Initialization ───────────────────────────────────────────

/**
 * Exports the active document as a PNG, reads its dimensions, then
 * opens the flare editor popup with the image as a reference.
 */
function startPlugin() {
  $("#loadingSpinner").style.display = "inline-block";
  $("#message").innerText = "Loading plugin...\n\nPlease ensure that popups are allowed.";

  pea.exportImage("png").then((blob) => {
    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
      const img = new Image();
      img.addEventListener("load", () => {
        const popup = createPopup(img.width, img.height, img.src);
        $("#loadingSpinner").style.display = "none";

        if (popup) {
          $("#message").innerText = "Plugin opened in a popup window.";
        } else {
          $("#message").innerText = "Plugin failed to open.\n\nPlease allow popups from Photopea.";
        }
      });
      img.src = e.target.result;
    });
    reader.readAsDataURL(blob);
  });
}

// ─── Event Bindings ──────────────────────────────────────────────────

window.addEventListener("load", startPlugin);
$("#reloadButton").addEventListener("click", () => location.reload());
