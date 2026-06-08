import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import replace from '@rollup/plugin-replace';

const production = !process.env.ROLLUP_WATCH;
const isPhotoshopPlugin = process.env.PHOTOSHOP_PLUGIN === 'true';
const isPhotopeaPlugin = process.env.PHOTOPEA_PLUGIN === 'true';

let outputDir = 'public/build';
if (isPhotoshopPlugin) outputDir = 'photoshop-plugin/webview-contents/build';
else if (isPhotopeaPlugin) outputDir = 'photopea-plugin/frame-contents/build';

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

export default {
    input: 'src/main.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: outputDir + '/bundle.js',
    },
    plugins: [
        replace({
            preventAssignment: true,
            '__IS_PHOTOSHOP_PLUGIN__': JSON.stringify(isPhotoshopPlugin),
            '__IS_PHOTOPEA_PLUGIN__': JSON.stringify(isPhotopeaPlugin),
        }),

        svelte({
            compilerOptions: {
                // enable run-time checks when not in production
                dev: !production
            }
        }),
        // we'll extract any component CSS out into
        // a separate file - better for performance
        css({ output: 'bundle.css' }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs(),

        json({
            compact: true,
        }),

        image(),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
};
