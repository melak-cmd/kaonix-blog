import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// GitHub Pages serves project sites from a subpath (e.g. /kaonix-blog/).
// The workflow sets PUBLIC_BASE_PATH; local dev and Docker stay at root.
const basePath = process.env.PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.SITE_URL ?? "https://doli.kaonix.local";

export default defineConfig({
  site: siteUrl,
  base: basePath || undefined,
  trailingSlash: "ignore",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
    },
  },
});
