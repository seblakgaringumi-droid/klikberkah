export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const productId = url.searchParams.get("product");
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = /facebookexternalhit|whatsapp|twitterbot|telegrambot|bingbot|googlebot|linkedinbot|slackbot|discordbot/i.test(userAgent);

    // Dynamic OpenGraph metadata injection untuk WhatsApp / Social Media / Browsers
    if (productId && (!url.pathname.includes('.') || url.pathname === "/" || url.pathname === "/index.html")) {
      try {
        // Ambil HTML dasar dari index.html
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);
        
        if (indexResponse.status === 200) {
          let html = await indexResponse.text();

          // Ambil data produk dari Supabase REST API
          const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "https://kquxfvcbgogjpthhsseg.supabase.co";
          const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdXhmdmNiZ29nanB0aGhzc2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MDI0OTEsImV4cCI6MjEwMTk3ODQ5MX0.xYs1LZHOYbNssk_6T0zpLzsXACjJxh4ksJnCMkUky9s";

          const productRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=*`, {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`
            }
          });

          if (productRes.ok) {
            const products = await productRes.json() as any[];
            if (products && products.length > 0) {
              const product = products[0];
              const priceStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.selling_price || 0);
              const title = `${product.name} - ${priceStr}`;
              const description = `Beli ${product.name} murah ${priceStr}/${product.unit || 'pcs'} di Toko Berkah. Pesan online cepat & praktis!`;
              let image = product.image_url || `${url.origin}/pwa-512x512.png`;
              if (image.startsWith('/')) {
                image = `${url.origin}${image}`;
              }

              // Bersihkan tag meta & title lama
              html = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
              html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
              html = html.replace(/<meta\s+property=["']og:[^"']*["'][^>]*>/gi, '');
              html = html.replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*>/gi, '');

              const dynamicTags = `
    <title>${title} | Toko Berkah</title>
    <meta name="description" content="${description}" />
    <meta property="og:site_name" content="Toko Berkah" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="600" />
    <meta property="og:image:height" content="600" />
    <meta property="og:image:alt" content="${product.name}" />
    <meta property="og:url" content="${url.href}" />
    <meta property="og:type" content="product" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />`;

              // Sisipkan langsung di awal tag <head>
              html = html.replace(/<head>/i, `<head>${dynamicTags}`);

              return new Response(html, {
                headers: {
                  "content-type": "text/html;charset=UTF-8",
                  "cache-control": "no-cache, no-store, must-revalidate",
                },
              });
            }
          }
        }
      } catch (err) {
        console.error("Error generating dynamic OG tags:", err);
      }
    }

    // Coba layani aset statis terlebih dahulu
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    // Untuk Single Page Application (SPA), jika rute tidak ditemukan (404),
    // layani index.html secara langsung dari binding ASSETS tanpa redirect HTTP
    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url.toString(), request));
  },
};
