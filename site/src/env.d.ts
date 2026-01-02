/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly SPOTIFY_CLIENT_ID: string
    readonly SPOTIFY_CLIENT_SECRET: string
    readonly SPOTIFY_REDIRECT_URI: string
    readonly PUBLIC_POSTHOG_API_KEY: string
    readonly PUBLIC_POSTHOG_HOST: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
