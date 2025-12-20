import type { APIRoute } from "astro"

export const GET: APIRoute = ({ url }) => {
    return new Response(JSON.stringify([]))
}
