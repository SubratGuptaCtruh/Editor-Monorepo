import { defineConfig } from "vite";

import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
    return {
        plugins: [
            VitePWA({
                devOptions: {
                    enabled: true,
                },
                srcDir: "src",
                filename: "service-worker.ts",
                strategies: "injectManifest",
                injectRegister: false,
                manifest: false,
                injectManifest: {
                    injectionPoint: null,
                },
            }),
        ],
        server: {
            port: 3000,
        },
        build: {
            target: "esnext", // or "es2019",
        },
    };
});
