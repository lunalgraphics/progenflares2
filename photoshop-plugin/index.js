const { app, core, imaging, constants, action } = require("photoshop");
const { entrypoints, storage } = require("uxp");
const fs = storage.localFileSystem;

let webView = document.getElementById("container");
let webViewLoaded = false;

/** @type {HTMLDialogElement} */
let modal = document.getElementById("dialog");

window.addEventListener("message", (e) => {
    if (typeof e.data == "string") e.data = JSON.parse(e.data);
    if (e.data.type == "webViewLoaded") {
        webViewLoaded = true;
    }
    else if (e.data.type == "exportLayer") {
        let view = Uint8Array.from(e.data.data);
        modal.close();

        core.executeAsModal(async () => {

            let imageData = await imaging.createImageDataFromBuffer(view, {
                width: app.activeDocument.width,
                height: app.activeDocument.height,
                components: 4,
                colorSpace: "RGB",
            });
            if (e.data.editingLayer != "yes") {
                let flareLayer = await app.activeDocument.layers.add();
                await imaging.putPixels({
                    layerID: flareLayer.id,
                    imageData: imageData,
                });
                flareLayer.bringToFront();
                flareLayer.name = "render";

                let textLayer = await app.activeDocument.createTextLayer({
                    contents: e.data.metadata,
                    position: { x: 0, y: app.activeDocument.height / 2 },
                    fontSize: 1,
                });
                textLayer.name = "metadata"
                textLayer.visible = false;
                textLayer.bringToFront();

                // convert to smart object
                app.activeDocument.activeLayers = [flareLayer, textLayer];
                action.batchPlay([
                    {
                        _obj: "newPlacedLayer",
                        _isCommand: true,
                        _options: {
                            dialogOptions: "dontDisplay",
                        }
                    }
                ], {});

                app.activeDocument.activeLayers[0].name = "Lens Flare (Progen Flares 2)";
                app.activeDocument.activeLayers[0].blendMode = constants.BlendMode.SCREEN;
            }
            else {
                await action.batchPlay([
                    {
                        _obj: "placedLayerEditContents",
                        _options: {
                            dialogOptions: "dontDisplay",
                        }
                    }
                ], {});
                let textLayer = app.activeDocument.activeLayers[0];
                let flareLayer = app.activeDocument.layers[1];
                await imaging.putPixels({
                    layerID: flareLayer.id,
                    imageData: imageData,
                });
                textLayer.textItem.contents = e.data.metadata;
                
                await app.activeDocument.save();
                await app.activeDocument.close();
                app.activeDocument.activeLayers[0].visible = true;
            }
        }).catch(err => core.showAlert(err));
    }
    else if (e.data.type == "savePresets") {
        let userPresets = e.data.data;
        if (typeof userPresets == "string") userPresets = JSON.parse(userPresets);
        window.localStorage.setItem("userPresets", JSON.stringify(userPresets));
    }
});

async function waitForWebViewLoaded() {
    return new Promise((resolve) => {
        let interval = setInterval(() => {
            if (webViewLoaded) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

let modalVisible = false;

async function openModal(editingLayer=false, flareSettings) {
    if (modalVisible) return;

    core.executeAsModal(async () => {
        if (app.documents.length == 0) {
            core.showAlert("Open a document to use Progen Flares 2.");
            return;
        }

        let ogDoc = app.activeDocument;
        /*let tempDoc = await app.activeDocument.duplicate();
        await tempDoc.flatten();*/

        let { imageData, sourceBounds, level } = await imaging.getPixels({
            documentID: ogDoc.id,
            applyAlpha: true,
        });
        /*await tempDoc.closeWithoutSaving();
        app.activeDocument = ogDoc;*/
        
        modal.uxpShowModal({
            title: "Progen Flares 2",
            resize: "both",
            size: {
                width: 1280,
                height: 720,
            },
        });
        modalVisible = true;
        webView.src = `plugin:/webview-contents/index.html`;

        let b64 = await imaging.encodeImageData({ imageData: imageData, base64: true });
        let imgUrl = "data:image/jpeg;base64," + b64;

        await waitForWebViewLoaded();
        webView.postMessage({
            type: "init",
            docWidth: app.activeDocument.width,
            docHeight: app.activeDocument.height,
            editingLayer: editingLayer ? "yes" : "no",
        });
        webView.postMessage({
            type: "refImage",
            data: imgUrl,
        });
        if (editingLayer && flareSettings) {
            webView.postMessage({
                type: "flareSettings",
                data: flareSettings,
            });
        }

        if (window.localStorage.getItem("userPresets")) {
            let userPresets = JSON.parse(window.localStorage.getItem("userPresets"));
            webView.postMessage({
                type: "loadPresets",
                data: userPresets,
            });
        }
    }).catch(err => core.showAlert(err));
};

async function editLayer() {
    if (app.documents.length == 0) {
        core.showAlert("Open a document to use Progen Flares 2.");
        return;
    }

    let layer = app.activeDocument.activeLayers[0];
    if (layer.kind != constants.LayerKind.SMARTOBJECT) {
        core.showAlert("Selected layer is not a Progen Flares 2 object.");
        return;
    }
    core.executeAsModal(async () => {
        await action.batchPlay([
            {
                _obj: "placedLayerEditContents",
                _options: {
                    dialogOptions: "dontDisplay",
                }
            }
        ], {});
        let textLayer = app.activeDocument.activeLayers[0];
        if (textLayer.kind != constants.LayerKind.TEXT) {
            await app.activeDocument.close(constants.SaveOptions.DONOTSAVECHANGES);
            await core.showAlert("Selected layer is not a Progen Flares 2 object.");
            return;
        }
        let flareSettings = textLayer.textItem.contents;
        flareSettings = flareSettings.replaceAll("”", '"');

        await app.activeDocument.close(constants.SaveOptions.DONOTSAVECHANGES);
        layer.visible = false;
        openModal(true, flareSettings);
    });
}

document.getElementById("launchBtn").addEventListener("click", () => openModal(false));
document.getElementById("editSelectedBtn").addEventListener("click", () => editLayer());

modal.addEventListener("close", () => {
    modalVisible = false;
    webViewLoaded = false;
});