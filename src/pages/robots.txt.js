const siteUrl = process.env.SITE_URL ?? "https://kaonix.blog.local";
const basePath = process.env.PUBLIC_BASE_PATH ?? "";

export function GET() {
  const sitemap = `${siteUrl}${basePath}/sitemap-index.xml`;
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
