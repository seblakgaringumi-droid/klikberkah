export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Cloudflare Workers with [assets] otomatis melayani file statis dari ./dist
    // Request API atau fallback dapat ditangani di sini
    return new Response("Not found", { status: 404 });
  },
};
