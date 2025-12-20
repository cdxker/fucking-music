import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
    },
    resolve: {
        alias: {
            "@": "/home/cdxker/Programs/fucking-music/site/src",
        },
    },
})
