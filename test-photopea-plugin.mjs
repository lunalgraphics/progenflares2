import { exec } from 'child_process';
import express from 'express';
import chokidar from 'chokidar';

const PORT = 8181;

// Start express static server
const app = express();
app.use(express.static('photopea-plugin', { etag: false, lastModified: false }));
app.listen(PORT, () => {
    console.log(`Dev server on http://localhost:${PORT}`);
});

// Watch for changes and rebuild
const watcher = chokidar.watch("src", {
    ignoreInitial: true,
    awaitWriteFinish: true,
});
watcher.on("change", (path) => {
    console.log(`File changed at path ${path}`);
    exec(`npm run build:photopea`, (err, out) => {
        if (err) {
            console.error("Build failed:", err.message);
            return;
        }
        console.log("Rebuilt project");
    });
});

// Get Photopea URL
const url = `https://www.photopea.com#${encodeURIComponent(JSON.stringify({
    environment: {
        plugins: [{
            name: "Progen Flares 2",
            url: "http://localhost:" + PORT,
            // we use hosted icon to avoid CORS issues (Chromium local-network-access)
            icon: "https://lunalgraphics.com/progenflares2/photopea-plugin/icon120.png",
        }]
    }
}))}`;

const start = process.platform === 'darwin' ? 'open' : 
              process.platform === 'win32' ? 'start' : 'xdg-open';

console.log("URL:", url);
exec(`${start} ${url}`);
