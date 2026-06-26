import { exec } from 'child_process';
import chokidar from 'chokidar';

const PORT = 8181;

// Open dev server
let sirvProcess = exec(`npx sirv photopea-plugin --port ${PORT}`);
sirvProcess.on("exit", () => {
    console.log("Server closed. Restarting...");
    setTimeout(() => {
        sirvProcess = exec(`npx sirv photopea-plugin --port ${PORT}`);
        console.log("Server restarted.");
    }, 200);
});

// Watch for changes
let watcher = chokidar.watch("src", {
    ignoreInitial: true,
    awaitWriteFinish: true,
});
watcher.on("change", (path) => {
    console.log(`File changed at path ${path}`);
    exec(`npm run build:photopea`, (err, out) => {
        console.log("Rebuilt project");
        sirvProcess.kill();
    });
});

// Get Photopea URL
let url = `https://www.photopea.com#${encodeURIComponent(JSON.stringify({
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