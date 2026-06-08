/**
 * Progen Flares 2 — Photoshop UXP Plugin Entry Point
 *
 * Handles communication between the Photoshop host and the embedded
 * WebView that runs the Svelte flare editor UI. Manages layer creation,
 * smart object editing, and preset persistence.
 */

const { app, core, imaging, constants, action } = require("photoshop");
const { storage } = require("uxp");

// ─── DOM References ──────────────────────────────────────────────────

const webView = document.getElementById("container");
/** @type {HTMLDialogElement} */
const modal = document.getElementById("dialog");

// ─── State ───────────────────────────────────────────────────────────

let webViewLoaded = false;
let modalVisible = false;

// ─── WebView Message Handling ────────────────────────────────────────

window.addEventListener("message", (e) => {
  if (typeof e.data === "string") e.data = JSON.parse(e.data);

  switch (e.data.type) {
    case "webViewLoaded":
      webViewLoaded = true;
      break;

    case "exportLayer":
      handleExportLayer(e.data);
      break;

    case "savePresets":
      persistUserPresets(e.data.data);
      break;
  }
});

/**
 * Handles the "exportLayer" message from the WebView.
 * Creates or updates a Photoshop layer with the rendered flare image data.
 */
function handleExportLayer(data) {
  modal.close();

  // Decode base64 → binary string → Uint8Array of raw RGBA bytes
  let binary = atob(data.data);
  let bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
  }

  core.executeAsModal(async () => {
    const imageData = await imaging.createImageDataFromBuffer(bytes, {
      width: app.activeDocument.width,
      height: app.activeDocument.height,
      components: 4,
      colorSpace: "RGB",
    });

    if (data.editingLayer !== "yes") {
      await createNewFlareLayer(imageData, data.metadata);
    } else {
      await updateExistingFlareLayer(imageData, data.metadata);
    }
  }).catch((err) => core.showAlert(err));
}

/**
 * Creates a new flare layer + metadata text layer, then wraps them
 * into a smart object with screen blend mode.
 */
async function createNewFlareLayer(imageData, metadata) {
  const flareLayer = await app.activeDocument.layers.add();
  await imaging.putPixels({
    layerID: flareLayer.id,
    imageData,
  });
  flareLayer.bringToFront();
  flareLayer.name = "render";

  // Hidden text layer stores flare settings as JSON for later editing
  const textLayer = await app.activeDocument.createTextLayer({
    contents: metadata,
    position: { x: 0, y: app.activeDocument.height / 2 },
    fontSize: 1,
  });
  textLayer.name = "metadata";
  textLayer.visible = false;
  textLayer.bringToFront();

  // Convert both layers into a single smart object
  app.activeDocument.activeLayers = [flareLayer, textLayer];
  await action.batchPlay([
    {
      _obj: "newPlacedLayer",
      _isCommand: true,
      _options: { dialogOptions: "dontDisplay" },
    },
  ], {});

  app.activeDocument.activeLayers[0].name = "Lens Flare (Progen Flares 2)";
  app.activeDocument.activeLayers[0].blendMode = constants.BlendMode.SCREEN;
}

/**
 * Opens an existing smart object and updates the flare render + metadata.
 */
async function updateExistingFlareLayer(imageData, metadata) {
  await action.batchPlay([
    {
      _obj: "placedLayerEditContents",
      _options: { dialogOptions: "dontDisplay" },
    },
  ], {});

  const textLayer = app.activeDocument.activeLayers[0];
  const flareLayer = app.activeDocument.layers[1];

  await imaging.putPixels({
    layerID: flareLayer.id,
    imageData,
  });
  textLayer.textItem.contents = metadata;

  await app.activeDocument.save();
  await app.activeDocument.close();
  app.activeDocument.activeLayers[0].visible = true;
}

/**
 * Saves user-imported presets to localStorage for persistence across sessions.
 */
function persistUserPresets(presets) {
  let userPresets = presets;
  if (typeof userPresets === "string") {
    userPresets = JSON.parse(userPresets);
  }
  window.localStorage.setItem("userPresets", JSON.stringify(userPresets));
}

// ─── WebView Lifecycle ───────────────────────────────────────────────

/**
 * Returns a promise that resolves once the WebView reports it's loaded.
 */
function waitForWebViewLoaded() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (webViewLoaded) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

// ─── Modal Launch ────────────────────────────────────────────────────

/**
 * Opens the flare editor modal with the current document as reference.
 *
 * @param {boolean} editingLayer - Whether we're editing an existing flare layer.
 * @param {string|null} flareSettings - JSON settings from an existing layer (if editing).
 */
async function openModal(editingLayer = false, flareSettings = null) {
  if (modalVisible) return;

  core.executeAsModal(async () => {
    if (app.documents.length === 0) {
      core.showAlert("Open a document to use Progen Flares 2.");
      return;
    }

    // Capture the current document composite as a reference image
    const { imageData } = await imaging.getPixels({
      documentID: app.activeDocument.id,
      applyAlpha: true,
    });

    modal.uxpShowModal({
      title: "Progen Flares 2",
      resize: "both",
      size: { width: 1280, height: 720 },
    });
    modalVisible = true;
    webView.src = "plugin:/webview-contents/index.html";

    const b64 = await imaging.encodeImageData({ imageData, base64: true });
    const imgUrl = "data:image/jpeg;base64," + b64;

    await waitForWebViewLoaded();

    // Send initialization data to the WebView
    webView.postMessage({
      type: "init",
      docWidth: app.activeDocument.width,
      docHeight: app.activeDocument.height,
      editingLayer: editingLayer ? "yes" : "no",
    });
    webView.postMessage({ type: "refImage", data: imgUrl });

    // If editing an existing layer, send its saved settings
    if (editingLayer && flareSettings) {
      webView.postMessage({ type: "flareSettings", data: flareSettings });
    }

    // Restore user's saved presets
    const savedPresets = window.localStorage.getItem("userPresets");
    if (savedPresets) {
      webView.postMessage({
        type: "loadPresets",
        data: JSON.parse(savedPresets),
      });
    }
  }).catch((err) => core.showAlert(err));
}

// ─── Edit Existing Layer ─────────────────────────────────────────────

/**
 * Attempts to open the selected smart object layer for re-editing.
 * Validates that it's a Progen Flares 2 smart object by checking
 * for a metadata text layer inside.
 */
async function editLayer() {
  if (app.documents.length === 0) {
    core.showAlert("Open a document to use Progen Flares 2.");
    return;
  }

  const layer = app.activeDocument.activeLayers[0];
  if (layer.kind !== constants.LayerKind.SMARTOBJECT) {
    core.showAlert("Selected layer is not a Progen Flares 2 object.");
    return;
  }

  core.executeAsModal(async () => {
    // Open the smart object contents
    await action.batchPlay([
      {
        _obj: "placedLayerEditContents",
        _options: { dialogOptions: "dontDisplay" },
      },
    ], {});

    const textLayer = app.activeDocument.activeLayers[0];
    if (textLayer.kind !== constants.LayerKind.TEXT) {
      await app.activeDocument.close(constants.SaveOptions.DONOTSAVECHANGES);
      await core.showAlert("Selected layer is not a Progen Flares 2 object.");
      return;
    }

    // Extract settings JSON from the metadata text layer
    let flareSettings = textLayer.textItem.contents;
    flareSettings = flareSettings.replaceAll("\u201C", '"').replaceAll("\u201D", '"'); // Fix smart quotes

    await app.activeDocument.close(constants.SaveOptions.DONOTSAVECHANGES);
    layer.visible = false;
    openModal(true, flareSettings);
  });
}

// ─── UI Button Bindings ──────────────────────────────────────────────

document.getElementById("launchBtn").addEventListener("click", () => openModal(false));
document.getElementById("editSelectedBtn").addEventListener("click", () => editLayer());

modal.addEventListener("close", () => {
  modalVisible = false;
  webViewLoaded = false;
});
