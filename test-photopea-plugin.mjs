import { exec } from 'child_process';
import { watch } from 'fs';

const PORT = 8181;

// Open dev server
exec(`npx sirv photopea-plugin --port ${PORT}`);

// Watch for changes
watch("src", { recursive: true }, (eventType, filename) => {
    console.log(`${eventType}: ${filename}`);
    // need to debounce the rebuild
    exec(`npm run build:photopea`, (err, out) => {

        console.log(out);
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