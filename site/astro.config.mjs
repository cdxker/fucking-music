// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    "site": "https://fucking-music.com",
    server: {
        host: true,
        allowedHosts: ["fuckingmusic.com", "www.fuckingmusic.com"]
    }
});
